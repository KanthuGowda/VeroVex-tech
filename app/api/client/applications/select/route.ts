import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(request: Request) {
  try {
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

    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json(
        {
          message: "Application ID is required.",
        },
        { status: 400 }
      );
    }

    // Find client
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

    // Find the application and verify that
    // the project belongs to this client.
    const application =
      await prisma.projectApplication.findFirst({
        where: {
          id: applicationId,
          project: {
            clientId: user.client.id,
          },
        },
        include: {
          project: true,
        },
      });

    if (!application) {
      return NextResponse.json(
        {
          message:
            "Application not found or you do not have permission.",
        },
        { status: 404 }
      );
    }

    // Make sure the application has not already
    // been rejected.
    if (application.status === "REJECTED") {
      return NextResponse.json(
        {
          message:
            "This application has already been rejected.",
        },
        { status: 400 }
      );
    }

    // Select this student.
    const updatedApplication =
      await prisma.projectApplication.update({
        where: {
          id: applicationId,
        },
        data: {
          status: "ACCEPTED",
        },
      });

    // Reject other applicants for the same project.
    await prisma.projectApplication.updateMany({
      where: {
        projectId: application.projectId,
        id: {
          not: applicationId,
        },
        status: {
          in: ["PENDING",  "ACCEPTED"],
        },
      },
      data: {
        status: "REJECTED",
      },
    });

    return NextResponse.json({
      message:
        "Student selected successfully.",
      application: updatedApplication,
    });
  } catch (error) {
    console.error(
      "Select student error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to select student.",
      },
      { status: 500 }
    );
  }
}