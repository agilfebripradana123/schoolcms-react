import { useCallback, useEffect, useRef, useState, ReactNode } from "react";
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
  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const data = await me();
      setUser(data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data.user;
    } catch {
      return null;
    }
  }, []);

  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  };

  const bootRefreshed = useRef(false);

  // The authenticated user is initialised from a localStorage snapshot that
  // may predate a backend RBAC change (e.g. stale permissions: []). Reconcile
  // a restored session with GET /api/me exactly once per mount so effective
  // permissions converge without a manual logout/login. Guarded with a ref so
  // it can never re-fire after setUser triggers a re-render.
  useEffect(() => {
    if (bootRefreshed.current) return;
    const hasStoredSession = Boolean(
      localStorage.getItem(TOKEN_KEY) && localStorage.getItem(USER_KEY),
    );
    if (!hasStoredSession) return;
    bootRefreshed.current = true;
    // setUser persists inside refreshUser after awaiting GET /me, never
    // synchronously within this effect, so no cascading renders occur.
    // oxlint-disable-next-line react/set-state-in-effect
    refreshUser().catch(() => {});
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        refreshUser,
        logout,
        updateUser,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
