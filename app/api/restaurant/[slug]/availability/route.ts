import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Table } from "@prisma/client";
import { findAvailableTables } from "@/services/restaurant/findAvailableTables";

const prisma = new PrismaClient();

export const GET = async (req: NextRequest, res: NextResponse) => {
  const searchParams = new URLSearchParams(req.nextUrl.searchParams);
  const day = searchParams.get("day");
  const time = searchParams.get("time");
  const partySize = searchParams.get("partySize");
  const slug = req.nextUrl.pathname.split("/")[3];

  if (!day || !time || !partySize) {
    return NextResponse.json(
      { errorMessage: "invalid input provided" },
      { status: 400 },
    );
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: {
      slug,
    },
    select: {
      tables: true,
      open_time: true,
      close_time: true,
    },
  });

  if (!restaurant) {
    return NextResponse.json(
      { errorMessage: "invalid time provided" },
      { status: 400 },
    );
  }

  const searchTimesWithTables = (await findAvailableTables({
    time,
    day,
    restaurant,
  })) as {
    date: Date;
    time: string;
    tables: Table[];
  }[];

  if (!searchTimesWithTables) {
    return NextResponse.json(
      { errorMessage: "invalid data provided" },
      { status: 400 },
    );
  }

  const availableTimes = searchTimesWithTables
    .map((searchTime) => {
      const sumSeats = searchTime.tables.reduce((sum, table) => {
        return sum + table.seats;
      }, 0);

      return {
        time: searchTime.time,
        available: sumSeats >= Number(partySize),
      };
    })
    .filter((availability) => {
      const timeIsAfterOpening =
        new Date(`${day}T${availability.time}`) >=
        new Date(`${day}T${restaurant.open_time}`);

      const timeIsBeforeClosing =
        new Date(`${day}T${availability.time}`) <=
        new Date(`${day}T${restaurant.close_time}`);

      return timeIsAfterOpening && timeIsBeforeClosing;
    });

  return NextResponse.json(availableTimes, { status: 200 });
};
