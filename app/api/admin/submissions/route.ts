import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
      include: {
        project: true,
        student: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return NextResponse.json({
      submissions,
    });
  } catch (error) {
    console.error("ADMIN SUBMISSIONS ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to load submissions.",
      },
      { status: 500 }
    );
  }
}