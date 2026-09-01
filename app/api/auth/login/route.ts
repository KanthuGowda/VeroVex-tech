import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { createAuthToken } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      email,
      password,
      role,
    } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    if (user.role !== role) {
      return NextResponse.json(
        {
          message:
            "You do not have permission to use this login.",
        },
        { status: 403 }
      );
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const token = await createAuthToken(user.id);

const response = NextResponse.json(
  {
    message: "Login successful.",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  },
  { status: 200 }
);

response.cookies.set("verovex_token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
});

return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong while logging in.",
      },
      { status: 500 }
    );
  }
}