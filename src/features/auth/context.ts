import { createContext } from "react";
import type { User, LoginPayload } from "@/types";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
