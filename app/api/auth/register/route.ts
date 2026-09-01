import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      password,
      phone,
      college,
      course,
      graduationYear,
    } = body;

    // Require ALL student information
    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !college ||
      !course ||
      !graduationYear
    ) {
      return NextResponse.json(
        {
          message:
            "Please fill in all student details.",
        },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    // Check whether email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    // Create user + student profile
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "STUDENT",

        student: {
          create: {
            phone,
            college,
            course,
            graduationYear: Number(graduationYear),
          },
        },
      },

      include: {
        student: true,
      },
    });

    return NextResponse.json(
      {
        message:
          "Student account created successfully.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while creating the account.",
      },
      { status: 500 }
    );
  }
}