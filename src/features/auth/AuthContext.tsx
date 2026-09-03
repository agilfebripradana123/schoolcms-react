import { useState, ReactNode } from "react";
import type { User, LoginPayload, LoginResponse } from "@/types";
import { TOKEN_KEY, USER_KEY } from "@/lib/api/axios";
import { login as loginRequest, me } from "./api/auth.service";
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

  // Re-fetch the authenticated user (GET /api/me) so effective permissions
  // (role + additional) can be refreshed without logging out. Returns the
  // refreshed user, or null when the session is no longer valid.
  const refreshUser = async (): Promise<User | null> => {
    try {
      const data = await me();
      setUser(data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data.user;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        refreshUser,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
