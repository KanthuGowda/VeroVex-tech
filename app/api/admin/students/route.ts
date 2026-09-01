import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: {
        id: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      students,
    });
  } catch (error) {
    console.error("Admin students error:", error);

    return NextResponse.json(
      {
        message: "Unable to load students.",
      },
      { status: 500 }
    );
  }
}