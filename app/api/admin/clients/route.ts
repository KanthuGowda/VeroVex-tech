import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        user: true,
        projects: true,
      },
      orderBy: {
        user: {
          createdAt: "desc",
        },
      },
    });

    const formattedClients = clients.map((client) => ({
      ...client,
      jobs: client.projects ?? [],
    }));

    return NextResponse.json({
      clients: formattedClients,
    });
  } catch (error) {
    console.error("ADMIN CLIENTS ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to load clients.",
      },
      { status: 500 }
    );
  }
}