import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalStudents,
      totalClients,
      activeProjects,
      totalApplications,
      totalSubmissions,
      totalPayments,
    ] = await Promise.all([
      prisma.student.count(),

      prisma.client.count(),

      prisma.project.count({
        where: {
          status: {
            in: ["OPEN", "ASSIGNED", "SUBMITTED"],
          },
        },
      }),

      prisma.projectApplication.count(),

      prisma.submission.count(),

      prisma.payment.count(),
    ]);

    return NextResponse.json({
      totalStudents,
      totalClients,
      activeProjects,
      totalApplications,
      totalSubmissions,
      totalPayments,
    });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to load admin statistics.",
      },
      { status: 500 }
    );
  }
}