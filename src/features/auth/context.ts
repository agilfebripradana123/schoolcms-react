import { createContext } from "react";
import type { User, LoginPayload } from "@/types";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
