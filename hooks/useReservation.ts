import { Dispatch, SetStateAction, useState } from "react";

const useReservation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createReservation = async ({
    slug,
    partySize,
    day,
    time,
    bookerFirstName,
    bookerLastName,
    bookerPhone,
    bookerEmail,
    bookerOccasion,
    bookerRequest,
    setdidReserve,
  }: {
    slug: string;
    partySize: string;
    day: string;
    time: string;
    bookerFirstName: string;
    bookerLastName: string;
    bookerPhone: string;
    bookerEmail: string;
    bookerOccasion: string;
    bookerRequest: string;
    setdidReserve: Dispatch<SetStateAction<boolean>>;
  }) => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/restaurant/${slug}/reserve?day=${day}&time=${time}&partySize=${partySize}`,
        {
          method: "POST",
          body: JSON.stringify({
            bookerEmail,
            bookerPhone,
            bookerFirstName,
            bookerLastName,
            bookerOccasion,
            bookerRequest,
          }),
        },
      );
      setLoading(false);
      setdidReserve(true);

      const data = await response.json();

      return data;
    } catch (error: any) {
      setLoading(false);
      setError(error.errorMessage);
    }
  };

  return { loading, error, createReservation };
};

export default useReservation;
