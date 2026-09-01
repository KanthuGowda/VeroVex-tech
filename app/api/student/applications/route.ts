import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const studentEmail = request.headers.get("x-user-email");

    if (!studentEmail) {
      return NextResponse.json(
        {
          message: "Student email is required.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        {
          message: "Project ID is required.",
        },
        { status: 400 }
      );
    }

    // Find student using email
    const user = await prisma.user.findUnique({
      where: {
        email: studentEmail,
      },
      include: {
        student: true,
      },
    });

    if (
      !user ||
      user.role !== "STUDENT" ||
      !user.student
    ) {
      return NextResponse.json(
        {
          message: "Student account not found.",
        },
        { status: 404 }
      );
    }

    const studentId = user.student.id;

    // Find project
    const project = await prisma.project.findUnique({
      where: {
        id: String(projectId),
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

    // Project must be OPEN
    if (project.status !== "OPEN") {
      return NextResponse.json(
        {
          message:
            "This project is no longer available.",
        },
        { status: 400 }
      );
    }

    // Check existing application
    const existingApplication =
      await prisma.projectApplication.findUnique({
        where: {
          projectId_studentId: {
            projectId: String(projectId),
            studentId,
          },
        },
      });

    if (existingApplication) {
      return NextResponse.json(
        {
          message:
            "You have already applied for this project.",
          application: existingApplication,
        },
        { status: 409 }
      );
    }

    // Create application
    const application =
      await prisma.projectApplication.create({
        data: {
          projectId: String(projectId),
          studentId,
          status: "PENDING",
        },
      });

    return NextResponse.json(
      {
        message:
          "Application submitted successfully!",
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Student project application error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to submit application.",
      },
      { status: 500 }
    );
  }
}