import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import validator from "validator";
import bcrypt from "bcrypt";
import * as jose from "jose";

const prisma = new PrismaClient();

export const POST = async (req: NextRequest, res: NextResponse) => {
  try {
    const body = await req.json();
    const { email, password } = body;

    const errors: string[] = [];

    const validationSchema = [
      {
        valid: validator.isEmail(email),
        errorMessage: "Email is invalid",
      },
      {
        valid: validator.isLength(password, { min: 4 }),
        errorMessage: "Password is invalid",
      },
    ];

    validationSchema.forEach((check) => {
      if (!check.valid) {
        errors.push(check.errorMessage);
      }
    });

    if (errors.length) {
      return NextResponse.json({ errorMessage: errors[0] }, { status: 400 });
    }

    const userWithEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!userWithEmail) {
      return NextResponse.json(
        { errorMessage: "Email or password is invalid" },
        { status: 500 },
      );
    }

    const isMatch = await bcrypt.compare(password, userWithEmail.password);

    if (!isMatch) {
      return NextResponse.json(
        { errorMessage: "Email or password is invalid" },
        { status: 500 },
      );
    }

    const alg = "HS256";
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const token = await new jose.SignJWT({ email: userWithEmail.email })
      .setProtectedHeader({ alg })
      .setExpirationTime("24h")
      .sign(secret);

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      { errorMessage: "Internal server error" },
      { status: 500 },
    );
  }
};
