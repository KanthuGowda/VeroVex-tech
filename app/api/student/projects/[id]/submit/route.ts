import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
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

    const body = await request.json();

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const fileUrl =
      typeof body.fileUrl === "string"
        ? body.fileUrl.trim()
        : "";

    if (!description && !fileUrl) {
      return NextResponse.json(
        {
          message:
            "Please provide your work description or file link.",
        },
        { status: 400 }
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
            status: "ACCEPTED",
          },
        },
        submission: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found." },
        { status: 404 }
      );
    }

    // Make sure this student was actually accepted for this project
    if (project.applications.length === 0) {
      return NextResponse.json(
        {
          message:
            "You have not been assigned this project.",
        },
        { status: 403 }
      );
    }

    // Prevent duplicate submission
    if (project.submission) {
      return NextResponse.json(
        {
          message:
            "You have already submitted this project.",
        },
        { status: 409 }
      );
    }

    const submission = await prisma.submission.create({
      data: {
        projectId: id,
        studentId: user.student.id,
        description: description || null,
        fileUrl: fileUrl || null,
      },
    });

    await prisma.project.update({
      where: {
        id,
      },
      data: {
        status: "SUBMITTED",
      },
    });

    return NextResponse.json(
      {
        message: "Work submitted successfully!",
        submission,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("SUBMISSION ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to submit work.",
      },
      { status: 500 }
    );
  }
}