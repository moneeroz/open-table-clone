import { PrismaClient } from "@prisma/client";
import { headers } from "next/dist/client/components/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const GET = async (req: NextRequest, res: NextResponse) => {
  try {
    const headersList = headers();
    const bearer = headersList.get("authorization") as string;

    const token = bearer.split(" ")[1];

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

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      { errorMessage: "Internal server error" },
      { status: 500 },
    );
  }
};
