"use client";

import { getCookie } from "cookies-next";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from "react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  phone: string;
}
interface State {
  loading: boolean;
  data: User | null;
  error: string | null;
}
interface AuthState extends State {
  setAuthState: Dispatch<SetStateAction<State>>;
}

const initialState = {
  loading: true,
  data: null,
  error: null,
  setAuthState: () => {},
};

export const AuthenticationContext = createContext<AuthState>(initialState);

const AuthContext = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<State>(initialState);

  const fetchUser = async () => {
    setAuthState({
      data: null,
      error: null,
      loading: true,
    });
    try {
      const jwt = getCookie("jwt");

      if (!jwt) {
        return setAuthState({
          data: null,
          error: null,
          loading: false,
        });
      }

      const response = await fetch("/api/auth/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      const data = await response.json();

      setAuthState({
        data,
        error: null,
        loading: false,
      });
    } catch (error: any) {
      setAuthState({
        data: null,
        error: error.response.data.errorMessage,
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthenticationContext.Provider value={{ ...authState, setAuthState }}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export default AuthContext;
