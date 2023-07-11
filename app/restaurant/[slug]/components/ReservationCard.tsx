"use client";

import { partySize as PartySize, times } from "@/data";
import useAvailabilities from "@/hooks/useAvailabilities";
import { Time, convertToDisplayTime } from "@/utils/convertToDisplayTime";
import { CircularProgress } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import DatePicker from "react-datepicker";

const ReservationCard = ({
  openTime,
  closeTime,
  slug,
}: {
  openTime: string;
  closeTime: string;
  slug: string;
}) => {
  const { data, error, loading, fetchAvailabilities } = useAvailabilities();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [time, setTime] = useState(openTime);
  const [partySize, setPartySize] = useState(1);
  const [day, setDay] = useState(new Date().toISOString().split("T")[0]);

  console.log(data);

  const handleDateChange = (date: Date | null) => {
    if (!date) {
      return setSelectedDate(null);
    }

    setDay(date.toISOString().split("T")[0]);

    return setSelectedDate(date);
  };

  const handleClick = () => {
    fetchAvailabilities({
      slug,
      day,
      time,
      partySize,
    });
  };

  const filterTimesByOpenWindow = () => {
    const timesWithinWindow: typeof times = [];
    let isWithenWindow = false;
    times.forEach((time) => {
      if (time.time === openTime) {
        isWithenWindow = true;
      }
      if (isWithenWindow) {
        timesWithinWindow.push(time);
      }
      if (time.time === closeTime) {
        isWithenWindow = false;
      }
    });
    return timesWithinWindow;
  };

  return (
    <div className="fixed w-[20%] bg-white rounded p-3 shadow">
      <div className="text-center border-b pb-2 font-bold">
        <h4 className="mr-7 text-lg">Make a Reservation</h4>
      </div>
      <div className="my-3 flex flex-col">
        <label htmlFor="">Party size</label>
        <select
          name=""
          className="py-3 border-b font-light bg-transparent"
          id=""
          value={partySize}
          onChange={(e) => setPartySize(Number(e.target.value))}
        >
          {PartySize.map((size) => (
            <option value={size.value} key={size.label}>
              {size.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-between">
        <div className="flex flex-col w-[48%]">
          <label htmlFor="">Date</label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            className="py-3 border-b font-light text-reg w-24"
            dateFormat="MMMM d"
            wrapperClassName="w-[48%]"
          />
        </div>
        <div className="flex flex-col w-[48%]">
          <label htmlFor="">Time</label>
          <select
            name=""
            id=""
            className="py-[14.3px] border-b font-light bg-transparent"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          >
            {filterTimesByOpenWindow().map((time) => (
              <option value={time.time} key={time.displayTime}>
                {time.displayTime}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-5">
        <button
          className="bg-red-600 rounded w-full px-4 text-white font-bold h-16"
          onClick={handleClick}
          disabled={loading}
        >
          {loading ? <CircularProgress color="inherit" /> : "Find a Time"}
        </button>
      </div>
      {data && data.length ? (
        <div className="mt-4">
          <p className="text-reg">Select a Time</p>
          <div className="flex flex-wrap mt-2">
            {data.map((time) => {
              return time.available ? (
                <Link
                  href={`/reserve/${slug}?date=${day}T${time.time}&partySize=${partySize}`}
                  className="bg-red-600 cursor-pointer p-2 w-24 text-center text-white rounded mr-3 mb-3"
                  key={time.time}
                >
                  <p className="text-sm font-bold">
                    {convertToDisplayTime(time.time as Time)}
                  </p>
                </Link>
              ) : (
                <p
                  className="bg-gray-300 p-4 w-24 rounded mr-3 mb-3"
                  key={time.time}
                ></p>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ReservationCard;
