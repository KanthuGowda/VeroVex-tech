import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

async function getAdmin(request: NextRequest) {
  const email = request.headers.get("x-user-email");

  if (!email) {
    return null;
  }

  const admin = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!admin || admin.role !== "ADMIN") {
    return null;
  }

  return admin;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          message: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    const submissions = await prisma.submission.findMany({
      include: {
        project: true,
        student: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return NextResponse.json({
      submissions,
    });
  } catch (error) {
    console.error("ADMIN SUBMISSIONS GET ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to load submissions.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          message: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const submissionId = body.submissionId;
    const action = body.action;

    if (!submissionId || !action) {
      return NextResponse.json(
        {
          message: "Submission ID and action are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (action !== "APPROVE" && action !== "REJECT") {
      return NextResponse.json(
        {
          message: "Invalid submission action.",
        },
        {
          status: 400,
        }
      );
    }

    const submission = await prisma.submission.findUnique({
      where: {
        id: submissionId,
      },
      include: {
        project: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        {
          message: "Submission not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (submission.project.status !== "SUBMITTED") {
      return NextResponse.json(
        {
          message: "Only submitted projects can be reviewed.",
        },
        {
          status: 400,
        }
      );
    }

    if (action === "APPROVE") {
      await prisma.$transaction([
        prisma.submission.update({
          where: {
            id: submissionId,
          },
          data: {
            approvedAt: new Date(),
          },
        }),

        prisma.project.update({
          where: {
            id: submission.project.id,
          },
          data: {
            status: "COMPLETED",
          },
        }),
      ]);

      return NextResponse.json({
        message: "Submission approved successfully.",
      });
    }

    await prisma.$transaction([
      prisma.submission.update({
        where: {
          id: submissionId,
        },
        data: {
          approvedAt: null,
        },
      }),

      prisma.project.update({
        where: {
          id: submission.project.id,
        },
        data: {
          status: "IN_PROGRESS",
        },
      }),
    ]);

    return NextResponse.json({
      message: "Changes requested. Student can resubmit the work.",
    });
  } catch (error) {
    console.error("ADMIN SUBMISSIONS PATCH ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to update submission.",
      },
      {
        status: 500,
      }
    );
  }
}