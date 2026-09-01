import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get("x-user-email");

    if (!email) {
      return NextResponse.json(
        { message: "Client email is required." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        client: true,
      },
    });

    if (!user || user.role !== "CLIENT" || !user.client) {
      return NextResponse.json(
        { message: "Client account not found." },
        { status: 404 }
      );
    }

    const applications = await prisma.projectApplication.findMany({
      where: {
        project: {
          clientId: user.client.id,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            paymentAmount: true,
            skills: true,
            status: true,
            createdAt: true,
            submission: {
              select: {
                id: true,
                description: true,
                fileUrl: true,
                submittedAt: true,
              },
            },
          },
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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
    console.error("CLIENT APPLICATIONS ERROR:", error);

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