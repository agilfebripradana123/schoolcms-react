import axios from "axios";
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { loginPathForRole } from "@/features/auth/redirect";

export const TOKEN_KEY = "schoolcms_token";
export const USER_KEY = "schoolcms_user";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // ponytail: FormData needs browser boundary, not application/json
    if (config.data instanceof FormData && config.headers) {
      delete (config.headers as Record<string, unknown>)["Content-Type"];
      delete (config.headers as Record<string, unknown>)["content-type"];
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // The login endpoint returns 401 on invalid credentials. We must NOT
    // treat that as a session expiry, otherwise login would always redirect.
    const isLoginRequest = error.config?.url === "/login";

    if (error.response?.status === 401 && !isLoginRequest) {
      // Prefer the persisted snapshot of the authenticated user (set at login)
      // because React state is already gone by the time an async 401 fires.
      let role: string | null = null;
      try {
        const raw = localStorage.getItem(USER_KEY);
        if (raw) role = (JSON.parse(raw) as { role?: string })?.role ?? null;
      } catch {
        // corrupted payload — fall through to the last-role key
      }
      if (!role) role = localStorage.getItem("schoolcms_last_role");
      const loginPath = loginPathForRole(role);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (window.location.pathname !== loginPath) {
        window.location.href = loginPath;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
