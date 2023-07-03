import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import validator from "validator";

const prisma = new PrismaClient();

export const POST = async (req: NextRequest, res: NextResponse) => {
  const body = await req.json();

  const errors: string[] = [];

  const validationSchema = [
    {
      valid: validator.isLength(body.firstName, { min: 1, max: 15 }),
      errorMessage: "First name is invalid",
    },
    {
      valid: validator.isLength(body.lastName, { min: 1, max: 15 }),
      errorMessage: "Last name is invalid",
    },
    {
      valid: validator.isEmail(body.email),
      errorMessage: "Email invalid",
    },
    {
      valid: validator.isMobilePhone(body.phone),
      errorMessage: "Phone number is invalid",
    },
    {
      valid: validator.isLength(body.city, { min: 1, max: 15 }),
      errorMessage: "City is invalid",
    },
    {
      valid: validator.isStrongPassword(body.password),
      errorMessage: "Password is not strong",
    },
  ];

  validationSchema.forEach((check) => {
    if (!check.valid) {
      errors.push(check.errorMessage);
    }
  });

  if (errors.length) {
    // return new Response(errors[0], { status: 200 });
    return NextResponse.json({ errorMessage: errors[0] }, { status: 400 });
  }

  const userWithEmail = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });

  if (userWithEmail) {
    return NextResponse.json(
      { errorMessage: "This email is already linked to an account" },
      { status: 400 },
    );
  }

  // return new Response(body, { status: 200 });

  return NextResponse.json(body, { status: 200 });
};
