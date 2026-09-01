import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get("x-user-email");

    let studentId: string | null = null;

    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { student: true },
      });

      if (user?.student) {
        studentId = user.student.id;
      }
    }

    const appliedProjectIds = new Set<string>();

    if (studentId) {
      const applications = await prisma.projectApplication.findMany({
        where: {
          studentId,
        },
        select: {
          projectId: true,
        },
      });

      applications.forEach((application) => {
        appliedProjectIds.add(application.projectId);
      });
    }

    // IMPORTANT:
    // No clientId filter here.
    // Students can see OPEN projects from ALL clients.
    const projects = await prisma.project.findMany({
      where: {
        status: "OPEN",
      },
      include: {
        client: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedProjects = projects.map((project) => ({
      ...project,
      hasApplied: appliedProjectIds.has(project.id),
      client: {
        id: project.client.id,
        companyName: project.client.companyName,
        user: project.client.user
          ? {
              name: project.client.user.name,
              email: project.client.user.email,
            }
          : null,
      },
    }));

    return NextResponse.json({
      projects: formattedProjects,
    });
  } catch (error) {
    console.error("STUDENT OPPORTUNITIES ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to load opportunities.",
      },
      { status: 500 }
    );
  }
}
