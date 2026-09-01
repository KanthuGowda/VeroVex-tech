import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get student and user details
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found." },
        { status: 404 }
      );
    }

    // Get the student's old/legacy job applications separately
    const applications = await prisma.application.findMany({
      where: {
        studentId: id,
      },
      include: {
        Job: true,
      },
      orderBy: {
        appliedAt: "desc",
      },
    });

    return NextResponse.json({
      student: {
        ...student,
        applications,
      },
    });
  } catch (error) {
    console.error("ADMIN STUDENT DETAILS ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to load student.",
      },
      { status: 500 }
    );
  }
}