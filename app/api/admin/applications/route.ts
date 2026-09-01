import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
export async function GET() {
  try {
    const applications = await prisma.projectApplication.findMany({
      include: {
        project: true,
        student: {
          include: {
            user: true,
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
    console.error("ADMIN APPLICATIONS ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to load applications.",
      },
      { status: 500 }
    );
  }
}