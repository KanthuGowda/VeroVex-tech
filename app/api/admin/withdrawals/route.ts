import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

async function getAdmin(request: Request) {
  const email = request.headers.get("x-user-email");

  if (!email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

// GET - View all withdrawal requests
export async function GET(request: Request) {
  try {
    const admin = await getAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ withdrawals });
  } catch (error) {
    console.error("ADMIN WITHDRAWALS GET ERROR:", error);

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

// PATCH - Update withdrawal status
export async function PATCH(request: Request) {
  try {
    const admin = await getAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { withdrawalId, status } = body;

    if (!withdrawalId || !status) {
      return NextResponse.json(
        { message: "Withdrawal ID and status are required." },
        { status: 400 }
      );
    }

    const allowedStatuses = [
      "PENDING",
      "APPROVED",
      "PAID",
      "REJECTED",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid withdrawal status." },
        { status: 400 }
      );
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: {
        id: withdrawalId,
      },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { message: "Withdrawal request not found." },
        { status: 404 }
      );
    }

    // Prevent changing a completed payment
    if (withdrawal.status === "PAID") {
      return NextResponse.json(
        { message: "A paid withdrawal cannot be changed." },
        { status: 400 }
      );
    }

    const updatedWithdrawal = await prisma.withdrawal.update({
      where: {
        id: withdrawalId,
      },
      data: {
        status,
        processedAt:
          status === "APPROVED" ||
          status === "PAID" ||
          status === "REJECTED"
            ? new Date()
            : null,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: `Withdrawal marked as ${status}.`,
      withdrawal: updatedWithdrawal,
    });
  } catch (error) {
    console.error("ADMIN WITHDRAWALS PATCH ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to update withdrawal.",
      },
      { status: 500 }
    );
  }
}