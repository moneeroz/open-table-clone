import { AuthenticationContext } from "@/context/AuthContext";
import { cookies } from "next/dist/client/components/headers";
import { useContext } from "react";

const useAuth = () => {
  const { data, error, loading, setAuthState } = useContext(
    AuthenticationContext,
  );

  const signin = async (
    {
      email,
      password,
    }: {
      email: string;
      password: string;
    },
    handleClose: () => void,
  ) => {
    setAuthState({
      data: null,
      error: null,
      loading: true,
    });

    try {
      const response = await fetch("http://localhost:3000/api/auth/signin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();

        console.log(data.errorMessage);
        setAuthState({
          data: null,
          error: data.errorMessage,
          loading: false,
        });

        return;
      }
      const data = await response.json();
      // const token = data.token;

      // console.log(data);

      setAuthState({
        data: data,
        error: null,
        loading: false,
      });
      handleClose();
    } catch (error: any) {
      console.log("Error:", error);
      setAuthState({
        data: null,
        error: error,
        loading: false,
      });
    }
  };

  const signup = async (
    {
      firstName,
      lastName,
      email,
      password,
      city,
      phone,
    }: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      city: string;
      phone: string;
    },
    handleClose: () => void,
  ) => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          city,
          phone,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        console.log(data.errorMessage);
        setAuthState({
          data: null,
          error: data.errorMessage,
          loading: false,
        });

        return;
      }
      const data = await response.json();
      // const token = data.token;

      console.log(data);

      setAuthState({
        data: data,
        error: null,
        loading: false,
      });
      handleClose();
    } catch (error: any) {
      console.log("Error:", error);
      setAuthState({
        data: null,
        error: error,
        loading: false,
      });
    }
  };

  const fetchUser = async () => {
    setAuthState({
      data: null,
      error: null,
      loading: true,
    });
    try {
      const cookieStore = cookies();
      const jwt = cookieStore.get("jwt");
      console.log(jwt);

      if (!jwt) {
        return setAuthState({
          data: null,
          error: null,
          loading: false,
        });
      }

      const response = await fetch("http://localhost:3000/api/auth/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt.value}`,
        },
      });

      const data = await response.json();
      console.log({ data });

      setAuthState({
        data: data,
        error: null,
        loading: false,
      });
    } catch (error: any) {
      setAuthState({
        data: null,
        error: error,
        loading: false,
      });
    }
  };

  return { signin, signup, fetchUser };
};

export default useAuth;
