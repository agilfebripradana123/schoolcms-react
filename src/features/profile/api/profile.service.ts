import { api } from "@/lib/api";
import { PROFILE } from "@/lib/api";
import type {
  ApiMessageResponse,
  UpdatePasswordPayload,
  UpdateProfilePayload,
  UpdateProfileResponse,
} from "./types";

export const profileService = {
  async updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
    return api.put<UpdateProfileResponse>(PROFILE.PROFILE, payload);
  },

  async updatePassword(payload: UpdatePasswordPayload): Promise<ApiMessageResponse> {
    return api.put<ApiMessageResponse>(PROFILE.PASSWORD, payload);
  },
};
