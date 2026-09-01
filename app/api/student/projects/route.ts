import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
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

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          {
            status: "OPEN",
          },
          {
            applications: {
              some: {
                studentId: user.student.id,
                status: "ACCEPTED",
              },
            },
          },
        ],
      },
      include: {
        client: {
          select: {
            companyName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      projects,
    });
  } catch (error) {
    console.error("Student projects error:", error);

    return NextResponse.json(
      {
        message: "Unable to load projects.",
      },
      {
        status: 500,
      }
    );
  }
}