import { useState, ReactNode } from "react";
import type { User, LoginPayload, LoginResponse } from "@/types";
import { TOKEN_KEY, USER_KEY } from "@/lib/api/axios";
import { login as loginRequest } from "./api/auth.service";
import { AuthContext } from "./context";

function parseStoredUser(): User | null {
  const storedUser = localStorage.getItem(USER_KEY);
  const storedToken = localStorage.getItem(TOKEN_KEY);

  if (!storedUser || !storedToken) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    // Corrupted stored user data: clear both keys so the user can re-authenticate.
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => parseStoredUser());
  const [token, setToken] = useState<string | null>(() => {
    if (parseStoredUser()) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  });
  const [isLoading] = useState(false);

  const login = async (payload: LoginPayload) => {
    const data: LoginResponse = await loginRequest(payload);

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
