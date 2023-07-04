import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import validator from "validator";
import bcrypt from "bcrypt";
import * as jose from "jose";

const prisma = new PrismaClient();

export const POST = async (req: NextRequest, res: NextResponse) => {
  const body = await req.json();
  const { firstName, lastName, email, phone, city, password } = body;

  const errors: string[] = [];

  const validationSchema = [
    {
      valid: validator.isLength(firstName, { min: 1, max: 15 }),
      errorMessage: "First name is invalid",
    },
    {
      valid: validator.isLength(lastName, { min: 1, max: 15 }),
      errorMessage: "Last name is invalid",
    },
    {
      valid: validator.isEmail(email),
      errorMessage: "Email invalid",
    },
    {
      valid: validator.isMobilePhone(phone),
      errorMessage: "Phone number is invalid",
    },
    {
      valid: validator.isLength(city, { min: 1, max: 15 }),
      errorMessage: "City is invalid",
    },
    {
      valid: validator.isStrongPassword(password),
      errorMessage: "Password is not strong",
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

  if (userWithEmail) {
    return NextResponse.json(
      { errorMessage: "This email is already linked to an account" },
      { status: 400 },
    );
  }

  const salt: number = 10;
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      first_name: firstName,
      last_name: lastName,
      password: hashedPassword,
      city,
      phone,
      email,
    },
  });

  const alg = "HS256";
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const token = await new jose.SignJWT({ email: user.email })
    .setProtectedHeader({ alg })
    .setExpirationTime("24h")
    .sign(secret);

  return NextResponse.json({ token }, { status: 200 });
};
