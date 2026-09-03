import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
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

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        client: {
          include: {
            projects: {
              include: {
                applications: {
                  select: {
                    id: true,
                    status: true,
                  },
                },
                payment: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    if (!user || user.role !== "CLIENT" || !user.client) {
      return NextResponse.json(
        {
          message: "Client account not found.",
        },
        { status: 404 }
      );
    }

    const projects = user.client.projects;

    const totalApplications = projects.reduce(
      (total, project) =>
        total + project.applications.length,
      0
    );

    return NextResponse.json({
      client: {
        id: user.client.id,
        companyName: user.client.companyName,
        phone: user.client.phone,
        website: user.client.website,
        address: user.client.address,
      },

      user: {
        name: user.name,
        email: user.email,
      },

      statistics: {
        totalProjects: projects.length,
        totalApplications,
      },

      projects,
    });
  } catch (error) {
    console.error("Client dashboard error:", error);

    return NextResponse.json(
      {
        message: "Unable to load client dashboard.",
      },
      { status: 500 }
    );
  }
}