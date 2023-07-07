import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

export async function middleware(req: NextRequest) {
  const bearer = req.headers.get("Authorization");

  if (!bearer) {
    return NextResponse.json("Unauthorized request", { status: 401 });
  }

  const token = bearer.split(" ")[1];

  if (!token) {
    return NextResponse.json("Unauthorized request", { status: 401 });
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  try {
    await jose.jwtVerify(token, secret);
  } catch (error) {
    return NextResponse.json("Unauthorized request", { status: 401 });
  }
}

export const config = {
  matcher: ["/api/auth/user"],
};
