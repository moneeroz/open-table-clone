"use client";

import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
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
  loading: false,
  data: null,
  error: null,
  setAuthState: () => {},
};

export const AuthenticationContext = createContext<AuthState>(initialState);

const AuthContext = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<State>(initialState);

  return (
    <AuthenticationContext.Provider value={{ ...authState, setAuthState }}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export default AuthContext;
