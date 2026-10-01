import { createContext } from "react";
import type { User, LoginPayload } from "@/types";
import { loginPathForRole } from "./redirect";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  refreshUser: () => Promise<User | null>;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  isAuthenticated: boolean;
}

/**
 * Resolve the login page for the current or most-recently-authenticated user.
 * Call this AFTER `logout()` — it falls back to `schoolcms_last_role` in
 * localStorage when `user` is already null.
 */
export function getLoginRedirectPath(user: User | null): string {
  const role = user?.role ?? localStorage.getItem("schoolcms_last_role");
  return loginPathForRole(role);
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
