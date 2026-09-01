import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(
    new URL("/student/login", "http://localhost:3000")
  );

  response.cookies.set("verovex_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}