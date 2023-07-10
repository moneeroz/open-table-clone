"use client";

import { partySize, times } from "@/data";
import { useState } from "react";
import DatePicker from "react-datepicker";

const ReservationCard = ({
  openTime,
  closeTime,
}: {
  openTime: string;
  closeTime: string;
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const handleDateChange = (date: Date | null) => {
    if (!date) {
      return setSelectedDate(null);
    }
    return setSelectedDate(date);
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
        >
          {partySize.map((size) => (
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
        <button className="bg-red-600 rounded w-full px-4 text-white font-bold h-16">
          Find a Time
        </button>
      </div>
    </div>
  );
};

export default ReservationCard;
