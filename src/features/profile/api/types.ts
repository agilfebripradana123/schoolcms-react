import type { User } from "@/types";

export interface UpdateProfilePayload {
  name?: string;
  username?: string | null;
  email?: string;
  photo?: string | null;
}

export interface UpdateProfileResponse {
  success?: boolean;
  message: string;
  user: User;
}

export interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ApiMessageResponse {
  success?: boolean;
  message: string;
}
