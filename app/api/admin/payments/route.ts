import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
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
    });

    return NextResponse.json({
      payments,
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