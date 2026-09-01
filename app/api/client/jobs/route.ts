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

    const user = await prisma.user.findUnique({
      where: { email },
      include: { client: true },
    });

    if (!user || user.role !== "CLIENT" || !user.client) {
      return NextResponse.json(
        { message: "Client account not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const {
      title,
      description,
      location,
      paymentAmount,
      skills,
      deadline,
    } = body;

    if (!title || !description || paymentAmount === undefined) {
      return NextResponse.json(
        {
          message:
            "Title, description and payment amount are required.",
        },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        clientId: user.client.id,
        title: String(title),
        description: String(description),
        location: location
          ? String(location)
          : "Work From Home",
        paymentAmount: Number(paymentAmount),
        skills: skills
          ? String(skills)
          : null,
       
        status: "OPEN",
      },
    });

    return NextResponse.json(
      {
        message: "Project created successfully!",
        project,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create project error:", error);

    return NextResponse.json(
      {
        message: "Unable to create project.",
      },
      { status: 500 }
    );
  }
}