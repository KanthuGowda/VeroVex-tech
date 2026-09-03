import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get("x-user-email");

    if (!email) {
      return NextResponse.json(
        { message: "Admin authentication required." },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { email },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    const [
      pendingApplications,
      submittedProjects,
      pendingWithdrawals,
      payments,
      recentStudents,
      recentClients,
      recentProjects,
    ] = await Promise.all([
      prisma.projectApplication.count({
        where: {
          status: "PENDING",
        },
      }),

      prisma.project.count({
        where: {
          status: "SUBMITTED",
        },
      }),

      prisma.withdrawal.count({
        where: {
          status: "PENDING",
        },
      }),

      prisma.payment.findMany({
        where: {
          status: {
            in: ["PAID", "RELEASED"],
          },
        },
        select: {
          amount: true,
          platformFee: true,
          studentAmount: true,
        },
      }),

      prisma.student.findMany({
        include: {
          user: true,
        },
        orderBy: {
          user: {
            createdAt: "desc",
          },
        },
        take: 5,
      }),

      prisma.client.findMany({
        include: {
          user: true,
        },
        orderBy: {
          user: {
            createdAt: "desc",
          },
        },
        take: 5,
      }),

      prisma.project.findMany({
        include: {
          client: {
            include: {
              user: true,
            },
          },
          assignedTo: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
      }),
    ]);

    const totalProjectValue = payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );

    const totalPlatformFee = payments.reduce(
      (sum, payment) => sum + Number(payment.platformFee),
      0
    );

    const totalStudentEarnings = payments.reduce(
      (sum, payment) => sum + Number(payment.studentAmount),
      0
    );

    return NextResponse.json({
      pending: {
        applications: pendingApplications,
        submissions: submittedProjects,
        withdrawals: pendingWithdrawals,
      },

      revenue: {
        totalProjectValue,
        platformFee: totalPlatformFee,
        studentEarnings: totalStudentEarnings,
      },

      recentStudents: recentStudents.map((student) => ({
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        college: student.college,
        course: student.course,
        createdAt: student.user.createdAt,
      })),

      recentClients: recentClients.map((client) => ({
        id: client.id,
        name: client.user.name,
        email: client.user.email,
        companyName: client.companyName,
        createdAt: client.user.createdAt,
      })),

      recentProjects: recentProjects.map((project) => ({
        id: project.id,
        title: project.title,
        status: project.status,
        amount: Number(project.paymentAmount),
        createdAt: project.createdAt,
        clientName: project.client.user.name,
        companyName: project.client.companyName,
        studentName: project.assignedTo?.user.name || null,
      })),
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to load admin dashboard.",
      },
      { status: 500 }
    );
  }
}