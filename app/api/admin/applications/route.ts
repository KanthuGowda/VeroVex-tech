
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

async function getAdmin(request: NextRequest) {
  const email = request.headers.get("x-user-email");

  if (!email) {
    return null;
  }

  const admin = await prisma.user.findUnique({
    where: { email },
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
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    const applications = await prisma.projectApplication.findMany({
      include: {
        project: {
          select: {
            id: true,
            title: true,
            paymentAmount: true,
            status: true,
          },
        },
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
    });

    return NextResponse.json({
      applications: applications.map((application) => ({
        id: application.id,
        status: application.status,
        appliedAt: application.appliedAt,

        project: {
          id: application.project.id,
          title: application.project.title,
          paymentAmount: Number(application.project.paymentAmount),
          status: application.project.status,
        },

        student: {
          id: application.student.id,
          phone: application.student.phone,
          college: application.student.college,
          course: application.student.course,
          graduationYear: application.student.graduationYear,

          user: {
            name: application.student.user.name,
            email: application.student.user.email,
          },
        },
      })),
    });
  } catch (error) {
    console.error("ADMIN APPLICATIONS GET ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to load applications.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const applicationId = body.applicationId;
    const status = body.status;

    const allowedStatuses = [
      "PENDING",
      "SHORTLISTED",
      "ACCEPTED",
      "REJECTED",
    ];

    if (!applicationId || !status) {
      return NextResponse.json(
        { message: "Application ID and status are required." },
        { status: 400 }
      );
    }

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid application status." },
        { status: 400 }
      );
    }

    const application = await prisma.projectApplication.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        project: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { message: "Application not found." },
        { status: 404 }
      );
    }

    if (status === "ACCEPTED") {
      if (
        application.project.status !== "OPEN" &&
        application.project.status !== "ASSIGNED"
      ) {
        return NextResponse.json(
          {
            message:
              "This project is no longer available for assignment.",
          },
          { status: 400 }
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        const accepted = await tx.projectApplication.update({
          where: {
            id: applicationId,
          },
          data: {
            status: "ACCEPTED",
          },
        });

        await tx.projectApplication.updateMany({
          where: {
            projectId: application.projectId,
            id: {
              not: applicationId,
            },
          },
          data: {
            status: "REJECTED",
          },
        });

        await tx.project.update({
          where: {
            id: application.projectId,
          },
          data: {
            assignedToId: application.studentId,
            status: "ASSIGNED",
          },
        });

        return accepted;
      });

      return NextResponse.json({
        message: "Application accepted and student assigned successfully.",
        application: result,
      });
    }

    const updated = await prisma.projectApplication.update({
      where: {
        id: applicationId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json({
      message: `Application ${status.toLowerCase()} successfully.`,
      application: updated,
    });
  } catch (error) {
    console.error("ADMIN APPLICATION PATCH ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to update application.",
      },
      { status: 500 }
    );
  }
}

