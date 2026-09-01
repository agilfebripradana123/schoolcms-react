import { api } from "@/lib/api";
import { AUTH } from "@/lib/api";
import type { LoginPayload, LoginResponse, User } from "@/types";

export interface MeResponse {
  user: User;
}

export interface LogoutResponse {
  message: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return api.post<LoginResponse>(AUTH.LOGIN, payload);
}

export async function me(): Promise<MeResponse> {
  return api.get<MeResponse>(AUTH.ME);
}

export async function logout(): Promise<LogoutResponse> {
  return api.post<LogoutResponse>(AUTH.LOGOUT);
}
