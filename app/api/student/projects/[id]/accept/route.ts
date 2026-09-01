
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
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

    if (!user || !user.student) {
      return NextResponse.json(
        { message: "Student account not found." },
        { status: 404 }
      );
    }

    const student = user.student;

    const project = await prisma.project.findUnique({
      where: {
        id: id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found." },
        { status: 404 }
      );
    }

    if (project.status !== "OPEN") {
      return NextResponse.json(
        { message: "This task is no longer available." },
        { status: 400 }
      );
    }

    if (project.assignedToId) {
      return NextResponse.json(
        { message: "This task has already been assigned." },
        { status: 400 }
      );
    }

    const existingApplication =
      await prisma.projectApplication.findUnique({
        where: {
          projectId_studentId: {
            projectId: id,
            studentId: student.id,
          },
        },
      });

    if (existingApplication) {
      if (existingApplication.status === "ACCEPTED") {
        return NextResponse.json({
          message: "Task already accepted.",
          accepted: true,
        });
      }

      const application =
        await prisma.projectApplication.update({
          where: {
            id: existingApplication.id,
          },
          data: {
            status: "ACCEPTED",
          },
        });

      await prisma.project.update({
        where: {
          id: id,
        },
        data: {
          assignedToId: student.id,
          status: "ASSIGNED",
        },
      });

      return NextResponse.json({
        message: "Task accepted successfully.",
        accepted: true,
        application,
      });
    }

    const application =
      await prisma.projectApplication.create({
        data: {
          projectId: id,
          studentId: student.id,
          status: "ACCEPTED",
        },
      });

    await prisma.project.update({
      where: {
        id: id,
      },
      data: {
        assignedToId: student.id,
        status: "ASSIGNED",
      },
    });

    return NextResponse.json({
      message: "Task accepted successfully.",
      accepted: true,
      application,
    });
  } catch (error) {
    console.error("Accept project error:", error);

    return NextResponse.json(
      { message: "Unable to accept task." },
      { status: 500 }
    );
  }
}

