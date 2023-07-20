import { findAvailableTables } from "@/services/restaurant/findAvailableTables";
import { PrismaClient, Table } from "@prisma/client";

import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const POST = async (req: NextRequest, res: NextResponse) => {
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

  const body = await req.json();
  const {
    bookerEmail,
    bookerPhone,
    bookerFirstName,
    bookerLastName,
    bookerOccasion,
    bookerRequest,
  } = body;

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
      id: true,
    },
  });

  if (!restaurant) {
    return NextResponse.json(
      { errorMessage: "invalid restaurant provided" },
      { status: 400 },
    );
  }

  const searchTimesWithTables = (await findAvailableTables({
    day,
    time,
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

  // console.log("searchTimesWithTables:", searchTimesWithTables);

  const searchTimeWithTables = searchTimesWithTables.find((t) => {
    return t.date.toISOString() === new Date(`${day}T${time}`).toISOString();
  });

  if (!searchTimeWithTables) {
    return NextResponse.json(
      { errorMessage: "No availability, cannot book" },
      { status: 400 },
    );
  }

  const tablesCount: { 2: number[]; 4: number[] } = {
    2: [],
    4: [],
  };

  searchTimeWithTables.tables.forEach((table) => {
    if (table.seats === 2) {
      tablesCount[2].push(table.id);
    } else {
      tablesCount[4].push(table.id);
    }
  });

  const tablesToBook: number[] = [];
  let seatsLeft = Number(partySize);

  while (seatsLeft > 0) {
    if (seatsLeft >= 3) {
      if (tablesCount[4].length) {
        tablesToBook.push(tablesCount[4][0]);
        tablesCount[4].shift();
        seatsLeft -= 4;
      } else {
        tablesToBook.push(tablesCount[2][0]);
        tablesCount[2].shift();
        seatsLeft -= 2;
      }
    } else {
      if (tablesCount[2].length) {
        tablesToBook.push(tablesCount[2][0]);
        tablesCount[2].shift();
        seatsLeft -= 2;
      } else {
        tablesToBook.push(tablesCount[4][0]);
        tablesCount[4].shift();
        seatsLeft -= 4;
      }
    }
  }

  const booking = await prisma.booking.create({
    data: {
      number_of_people: Number(partySize),
      booking_time: new Date(`${day}T${time}`),
      booker_email: bookerEmail,
      booker_phone: bookerPhone,
      booker_first_name: bookerFirstName,
      booker_last_name: bookerLastName,
      booker_occasion: bookerOccasion,
      booker_request: bookerRequest,
      restaurant_id: restaurant.id,
    },
  });

  const tablesToBookWithBookingId = tablesToBook.map((table_id) => {
    return {
      table_id,
      booking_id: booking.id,
    };
  });

  await prisma.bookingsOnTables.createMany({
    data: tablesToBookWithBookingId,
  });

  return NextResponse.json(
    {
      booking,
    },
    { status: 200 },
  );
};
