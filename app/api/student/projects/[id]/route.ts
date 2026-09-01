import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* GET PROJECT DETAILS */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const studentEmail = request.headers.get("x-user-email");

    if (!studentEmail) {
      return NextResponse.json(
        { message: "Student email is required." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: studentEmail,
      },
      include: {
        student: true,
      },
    });

    if (!user || user.role !== "STUDENT" || !user.student) {
      return NextResponse.json(
        { message: "Student account not found." },
        { status: 404 }
      );
    }

    const project = await prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        client: {
          select: {
            companyName: true,
          },
        },

        applications: {
          where: {
            studentId: user.student.id,
          },
          select: {
            id: true,
            status: true,
            appliedAt: true,
          },
        },

        submission: {
          select: {
            id: true,
            description: true,
            fileUrl: true,
            submittedAt: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found." },
        { status: 404 }
      );
    }

    const application = project.applications[0] || null;

    return NextResponse.json({
      project,
      application,

      accepted: application?.status === "ACCEPTED",

      submitted: project.submission !== null,

      submission: project.submission,
    });
  } catch (error) {
    console.error("PROJECT DETAILS ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to load project.",
      },
      { status: 500 }
    );
  }
}


/* ACCEPT PROJECT */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const studentEmail = request.headers.get("x-user-email");

    if (!studentEmail) {
      return NextResponse.json(
        {
          message: "Student email is required.",
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: studentEmail,
      },
      include: {
        student: true,
      },
    });

    if (!user || user.role !== "STUDENT" || !user.student) {
      return NextResponse.json(
        {
          message: "Student account not found.",
        },
        { status: 404 }
      );
    }

    const project = await prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        applications: {
          where: {
            studentId: user.student.id,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          message: "Project not found.",
        },
        { status: 404 }
      );
    }

    const application = project.applications[0];

    if (!application) {
      return NextResponse.json(
        {
          message:
            "You have not applied for this project.",
        },
        { status: 400 }
      );
    }

    if (application.status !== "ACCEPTED") {
      return NextResponse.json(
        {
          message:
            "You can accept this project only after the client selects you.",
        },
        { status: 400 }
      );
    }

    if (
      project.status !== "ASSIGNED" &&
      project.status !== "OPEN"
    ) {
      return NextResponse.json(
        {
          message:
            "This project is no longer available.",
        },
        { status: 400 }
      );
    }

    await prisma.project.update({
      where: {
        id,
      },
      data: {
        assignedToId: user.student.id,
        status: "ASSIGNED",
      },
    });

    return NextResponse.json({
      message: "Project accepted successfully!",
      accepted: true,
    });
  } catch (error) {
    console.error("ACCEPT PROJECT ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to accept project.",
      },
      { status: 500 }
    );
  }
}