import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(request: Request) {
  try {
    // Temporary authentication.
    // We will replace this with a proper session later.
    const email = request.headers.get("x-user-email");

    if (!email) {
      return NextResponse.json(
        {
          message: "Client email is required.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { applicationId, status } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        {
          message:
            "Application ID and status are required.",
        },
        { status: 400 }
      );
    }

    // Valid application statuses
    const allowedStatuses = [
      "PENDING",
      "SHORTLISTED",
      "REJECTED",
      "ACCEPTED",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          message: "Invalid application status.",
        },
        { status: 400 }
      );
    }

    // Find the client
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

    // Find the application and make sure
    // the project belongs to this client.
    const application =
      await prisma.projectApplication.findFirst({
        where: {
          id: applicationId,

          project: {
            clientId: user.client.id,
          },
        },
      });

    if (!application) {
      return NextResponse.json(
        {
          message:
            "Application not found or you do not have permission to modify it.",
        },
        { status: 404 }
      );
    }

    // Update application status
    const updatedApplication =
      await prisma.projectApplication.update({
        where: {
          id: applicationId,
        },

        data: {
          status,
        },
      });

    return NextResponse.json({
      message: `Application status updated to ${status}.`,
      application: updatedApplication,
    });
  } catch (error) {
    console.error(
      "Application status error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to update application status.",
      },
      { status: 500 }
    );
  }
}