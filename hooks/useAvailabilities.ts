import { useState } from "react";

const useAvailabilities = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState<
    { time: string; available: boolean }[] | null
  >(null);

  const fetchAvailabilities = async ({
    slug,
    partySize,
    day,
    time,
  }: {
    slug: string;
    partySize: number;
    day: string;
    time: string;
  }) => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/restaurant/${slug}/availability?day=${day}&time=${time}&partySize=${partySize}`,
        {
          method: "GET",
        },
      );
      setLoading(false);

      const data = await response.json();

      setData(data);
    } catch (error: any) {
      setLoading(false);
      setError(error.errorMessage);
    }
  };

  return { loading, error, data, fetchAvailabilities };
};

export default useAvailabilities;
