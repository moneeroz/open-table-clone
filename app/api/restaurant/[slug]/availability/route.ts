import { NextRequest, NextResponse } from "next/server";
import { times } from "@/data";
import { PrismaClient } from "@prisma/client";

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

  const searchTimes = times.find((t) => t.time === time)?.searchTimes;

  if (!searchTimes) {
    return NextResponse.json(
      { errorMessage: "invalid time provided" },
      { status: 400 },
    );
  }

  const bookings = await prisma.booking.findMany({
    where: {
      booking_time: {
        gte: new Date(`${day}T${searchTimes[0]}`),
        lte: new Date(`${day}T${searchTimes[searchTimes.length - 1]}`),
      },
    },
    select: {
      booking_time: true,
      number_of_people: true,
      tables: true,
    },
  });

  const bookingTableObj: { [key: string]: { [key: number]: true } } = {};

  bookings.forEach((booking) => {
    bookingTableObj[booking.booking_time.toISOString()] = booking.tables.reduce(
      (obj, table) => {
        return {
          ...obj,
          [table.table_id]: true,
        };
      },
      {},
    );
  });

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

  const tables = restaurant.tables;

  const searchTimesWithTables = searchTimes.map((searchTime) => {
    return {
      date: new Date(`${day}T${searchTime}`),
      time: searchTime,
      tables,
    };
  });

  searchTimesWithTables.forEach((searchTime) => {
    searchTime.tables = searchTime.tables.filter((table) => {
      if (
        bookingTableObj[searchTime.date.toISOString()] &&
        bookingTableObj[searchTime.date.toISOString()][table.id]
      ) {
        return false;
      }
      return true;
    });
  });

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
