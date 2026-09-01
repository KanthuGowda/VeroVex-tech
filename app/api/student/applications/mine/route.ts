import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  request: NextRequest
) {
  try {
    const studentEmail =
      request.headers.get("x-user-email");

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

    const applications =
      await prisma.projectApplication.findMany({
        where: {
          studentId: user.student.id,
        },
        include: {
          project: {
            include: {
              client: {
                select: {
                  companyName: true,
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
      applications,
    });
  } catch (error) {
    console.error(
      "My applications error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load your applications.",
      },
      { status: 500 }
    );
  }
}