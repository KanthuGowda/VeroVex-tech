import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      companyName,
      name,
      email,
      password,
      phone,
      website,
      address,
    } = body;

    if (!companyName || !name || !email || !password) {
      return NextResponse.json(
        {
          message:
            "Company name, contact name, email and password are required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          message: "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CLIENT",

        client: {
          create: {
            companyName,
            phone: phone || null,
            website: website || null,
            address: address || null,
          },
        },
      },

      include: {
        client: true,
      },
    });

    return NextResponse.json(
      {
        message: "Client account created successfully.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        client: user.client,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Client registration error:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong while creating the client account.",
      },
      { status: 500 }
    );
  }
}