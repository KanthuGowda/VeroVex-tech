import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const email = request.headers.get("x-user-email");

    if (!email) {
      return NextResponse.json(
        { message: "Student email is required." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        { message: "Student not found." },
        { status: 404 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student profile not found." },
        { status: 404 }
      );
    }

    const payments = await prisma.payment.findMany({
      where: {
        studentId: student.id,
        status: {
          in: ["PAID", "RELEASED"],
        },
      },
      include: {
        project: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalEarnings = payments.reduce(
      (total, payment) => total + Number(payment.studentAmount),
      0
    );

    return NextResponse.json({
      payments,
      totalEarnings,
    });
  } catch (error) {
    console.error("STUDENT PAYMENTS ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to load student payments.",
      },
      { status: 500 }
    );
  }
}