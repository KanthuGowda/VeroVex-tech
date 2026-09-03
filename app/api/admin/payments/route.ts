import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get("x-user-email");

    if (!email) {
      return NextResponse.json(
        { message: "Admin authentication required." },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { email },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    const [payments, withdrawals] = await Promise.all([
      prisma.payment.findMany({
        include: {
          project: true,
          student: {
            include: {
              user: true,
            },
          },
          client: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.withdrawal.findMany({
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
      }),
    ]);

    return NextResponse.json({
      payments,
      withdrawals,
    });
  } catch (error) {
    console.error("ADMIN PAYMENTS ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to load payments.",
      },
      { status: 500 }
    );
  }
}