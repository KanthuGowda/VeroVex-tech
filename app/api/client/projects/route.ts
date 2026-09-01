import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Get logged-in client email
    const email = request.headers.get("x-user-email");

    if (!email) {
      return NextResponse.json(
        {
          message: "Client email is required.",
        },
        { status: 401 }
      );
    }

    // Read request body
    const body = await request.json();

    const {
      title,
      description,
      location,
      paymentAmount,
      skills,
    } = body;

    // Validate required fields
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      paymentAmount === undefined ||
      paymentAmount === null ||
      paymentAmount === ""
    ) {
      return NextResponse.json(
        {
          message:
            "Title, description, and payment amount are required.",
        },
        { status: 400 }
      );
    }

    // Convert payment amount to number
    const amount = Number(paymentAmount);

    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json(
        {
          message:
            "Payment amount must be a valid positive number.",
        },
        { status: 400 }
      );
    }

    // Find logged-in client
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        client: true,
      },
    });

    if (
      !user ||
      user.role !== "CLIENT" ||
      !user.client
    ) {
      return NextResponse.json(
        {
          message: "Client account not found.",
        },
        { status: 404 }
      );
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        clientId: user.client.id,
        title: title.trim(),
        description: description.trim(),
        location:
          typeof location === "string" && location.trim()
            ? location.trim()
            : null,
        paymentAmount: amount,
        skills:
          typeof skills === "string" && skills.trim()
            ? skills.trim()
            : null,
      },
    });

    return NextResponse.json(
      {
        message: "Project created successfully.",
        project,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE PROJECT API ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to create project.",
      },
      { status: 500 }
    );
  }
}