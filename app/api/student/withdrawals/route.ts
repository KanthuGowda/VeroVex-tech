import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

async function getStudent(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.role !== "STUDENT") {
    return null;
  }

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
  });

  return student;
}

// GET withdrawal information
export async function GET(request: Request) {
  try {
    const email = request.headers.get("x-user-email");

    if (!email) {
      return NextResponse.json(
        { message: "Student email is required." },
        { status: 401 }
      );
    }

    const student = await getStudent(email);

    if (!student) {
      return NextResponse.json(
        { message: "Student not found." },
        { status: 404 }
      );
    }

    // Student's actual earnings = 60% of paid/released payments
    const payments = await prisma.payment.findMany({
      where: {
        studentId: student.id,
        status: {
          in: ["PAID", "RELEASED"],
        },
      },
    });

    const totalEarnings = payments.reduce(
      (total, payment) => total + Number(payment.studentAmount),
      0
    );

    // Money already requested/withdrawn should not be available again.
    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        studentId: student.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const withdrawnAmount = withdrawals
      .filter(
        (withdrawal) =>
          withdrawal.status === "PENDING" ||
          withdrawal.status === "APPROVED" ||
          withdrawal.status === "PAID"
      )
      .reduce(
        (total, withdrawal) => total + Number(withdrawal.amount),
        0
      );

    const availableBalance = Math.max(
      0,
      totalEarnings - withdrawnAmount
    );

    return NextResponse.json({
      totalEarnings,
      withdrawnAmount,
      availableBalance,
      withdrawals,
    });
  } catch (error) {
    console.error("STUDENT WITHDRAWALS GET ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to load withdrawals.",
      },
      { status: 500 }
    );
  }
}

// POST withdrawal request
export async function POST(request: Request) {
  try {
    const email = request.headers.get("x-user-email");

    if (!email) {
      return NextResponse.json(
        { message: "Student email is required." },
        { status: 401 }
      );
    }

    const student = await getStudent(email);

    if (!student) {
      return NextResponse.json(
        { message: "Student not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { message: "Please enter a valid withdrawal amount." },
        { status: 400 }
      );
    }

    // Get student's paid earnings
    const payments = await prisma.payment.findMany({
      where: {
        studentId: student.id,
        status: {
          in: ["PAID", "RELEASED"],
        },
      },
    });

    const totalEarnings = payments.reduce(
      (total, payment) => total + Number(payment.studentAmount),
      0
    );

    // Get existing withdrawal requests
    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        studentId: student.id,
      },
    });

    const withdrawnAmount = withdrawals
      .filter(
        (withdrawal) =>
          withdrawal.status === "PENDING" ||
          withdrawal.status === "APPROVED" ||
          withdrawal.status === "PAID"
      )
      .reduce(
        (total, withdrawal) => total + Number(withdrawal.amount),
        0
      );

    const availableBalance = Math.max(
      0,
      totalEarnings - withdrawnAmount
    );

    if (amount > availableBalance) {
      return NextResponse.json(
        {
          message: `Insufficient balance. Available balance is ₹${availableBalance.toFixed(
            2
          )}.`,
        },
        { status: 400 }
      );
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        studentId: student.id,
        amount,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        message: "Withdrawal request submitted successfully.",
        withdrawal,
        availableBalance: availableBalance - amount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("STUDENT WITHDRAWALS POST ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to create withdrawal request.",
      },
      { status: 500 }
    );
  }
}