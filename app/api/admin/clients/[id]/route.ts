import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        projects: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        {
          message: "Client not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      client,
    });
  } catch (error) {
    console.error("ADMIN CLIENT DETAILS ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to load client.",
      },
      { status: 500 }
    );
  }
}