import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const email = request.headers.get("x-user-email");

    if (!email) {
      return NextResponse.json(
        { message: "Client email is required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { message: "Project ID is required." },
        { status: 400 }
      );
    }

    // Find the logged-in client
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
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

    // Find the project and verify ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        clientId: user.client.id,
      },
      include: {
        submission: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          message:
            "Project not found or you do not have permission.",
        },
        { status: 404 }
      );
    }

    // A student must have submitted the work before payment
    if (!project.submission) {
      return NextResponse.json(
        {
          message:
            "Payment is available after the student submits the project.",
        },
        { status: 400 }
      );
    }

    // Check whether payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: {
        projectId: project.id,
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        {
          message: "Payment has already been created for this project.",
          payment: existingPayment,
        },
        { status: 400 }
      );
    }

    const amount = Number(project.paymentAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          message: "Invalid project payment amount.",
        },
        { status: 400 }
      );
    }

    // VeroVex platform fee = 40%
    const platformFee = amount * 0.40;

    // Student receives = 60%
    const studentAmount = amount * 0.60;

    const payment = await prisma.payment.create({
      data: {
        projectId: project.id,
        clientId: user.client.id,
        studentId: project.submission.studentId,
        amount,
        platformFee,
        studentAmount,
        status: "PAID",
        paidAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Payment successful.",
      payment,
    });
  } catch (error) {
    console.error("CLIENT PAYMENT ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to process payment.",
      },
      { status: 500 }
    );
  }
}