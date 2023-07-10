import { NextRequest, NextResponse } from "next/server";
import { times } from "@/data";

export const GET = async (req: NextRequest, res: NextResponse) => {
  const searchParams = new URLSearchParams(req.nextUrl.searchParams);
  const day = searchParams.get("day");
  const time = searchParams.get("time");
  const partySize = searchParams.get("partySize");

  if (
    !searchParams.has("day") ||
    !searchParams.has("time") ||
    !searchParams.has("partySize")
  ) {
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

  return NextResponse.json({ searchTimes }, { status: 200 });
};
