import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export const GET = async (req: NextRequest, res: NextResponse) => {
  try {
    const Bearer = req.headers.get("Authorization") as string;

    const token = Bearer.split(" ")[1];

    const payload = jwt.decode(token) as { email: string };

    const user = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        city: true,
        phone: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { errorMessage: "User not found" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        city: user.city,
        phone: user.phone,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      { errorMessage: "Internal server error" },
      { status: 500 },
    );
  }
};
