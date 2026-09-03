
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

async function getClient(request: NextRequest) {
  const email = request.headers.get("x-user-email");

  if (!email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      client: true,
    },
  });

  if (!user || user.role !== "CLIENT" || !user.client) {
    return null;
  }

  return user;
}

export async function PATCH(request: NextRequest) {
  try {
    const client = await getClient(request);

    if (!client || !client.client) {
      return NextResponse.json(
        {
          message: "Client authentication required.",
        },
        { status: 401 }
      );
    }

    // Store the client ID separately so TypeScript knows it is not null.
    const clientId = client.client.id;

    const body = await request.json();

    const applicationId =
      typeof body.applicationId === "string"
        ? body.applicationId
        : "";

    const action =
      typeof body.action === "string"
        ? body.action
        : "";

    if (!applicationId) {
      return NextResponse.json(
        {
          message: "Application ID is required.",
        },
        { status: 400 }
      );
    }

    if (action !== "APPROVE" && action !== "CHANGES") {
      return NextResponse.json(
        {
          message: "Invalid review action.",
        },
        { status: 400 }
      );
    }

    const application =
      await prisma.projectApplication.findUnique({
        where: {
          id: applicationId,
        },
        include: {
          project: {
            include: {
              submission: true,
            },
          },
          student: {
            include: {
              user: true,
            },
          },
        },
      });

    if (!application) {
      return NextResponse.json(
        {
          message: "Application not found.",
        },
        { status: 404 }
      );
    }

    // Verify that this project belongs to the logged-in client.
    if (application.project.clientId !== clientId) {
      return NextResponse.json(
        {
          message:
            "You do not have permission to review this project.",
        },
        { status: 403 }
      );
    }

    if (!application.project.submission) {
      return NextResponse.json(
        {
          message:
            "The student has not submitted the project yet.",
        },
        { status: 400 }
      );
    }

    if (application.project.status !== "SUBMITTED") {
      return NextResponse.json(
        {
          message:
            "This submission has already been reviewed.",
        },
        { status: 409 }
      );
    }

    /*
     * REQUEST CHANGES
     */
    if (action === "CHANGES") {
      await prisma.$transaction([
        prisma.project.update({
          where: {
            id: application.projectId,
          },
          data: {
            status: "IN_PROGRESS",
          },
        }),

        prisma.submission.update({
          where: {
            id: application.project.submission.id,
          },
          data: {
            approvedAt: null,
          },
        }),
      ]);

      return NextResponse.json({
        message:
          "Changes requested. Student can resubmit the work.",
      });
    }

    /*
     * APPROVE & PAY
     */

    const amount = Number(
      application.project.paymentAmount
    );

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          message: "Invalid project payment amount.",
        },
        { status: 400 }
      );
    }

    // Platform gets 40%.
    const platformFee = Number(
      (amount * 0.4).toFixed(2)
    );

    // Student gets 60%.
    const studentAmount = Number(
      (amount * 0.6).toFixed(2)
    );

    const existingPayment =
      await prisma.payment.findUnique({
        where: {
          projectId: application.projectId,
        },
      });

    if (existingPayment) {
      return NextResponse.json(
        {
          message:
            "Payment has already been recorded for this project.",
        },
        { status: 409 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Mark project as completed.
      await tx.project.update({
        where: {
          id: application.projectId,
        },
        data: {
          status: "COMPLETED",
        },
      });

      // Approve the submission.
      await tx.submission.update({
        where: {
          id: application.project.submission!.id,
        },
        data: {
          approvedAt: new Date(),
        },
      });

      // Create payment record.
      await tx.payment.create({
        data: {
          id: crypto.randomUUID(),
          projectId: application.projectId,
          clientId: clientId,
          studentId: application.studentId,
          amount,
          platformFee,
          studentAmount,
          status: "PAID",
          paidAt: new Date(),
          releasedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      message:
        `Project approved and payment recorded. ` +
        `Platform fee: ₹${platformFee.toFixed(2)}. ` +
        `Student earnings: ₹${studentAmount.toFixed(2)}.`,
    });
  } catch (error) {
    console.error("CLIENT REVIEW ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to review submission.",
      },
      { status: 500 }
    );
  }
}

