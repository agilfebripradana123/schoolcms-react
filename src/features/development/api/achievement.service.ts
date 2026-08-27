import { api } from "@/lib/api";
import { DEVELOPMENT } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  Achievement,
  CreateAchievementPayload,
  DevelopmentListParams,
  UpdateAchievementPayload,
} from "./types";

export const achievementService = {
  async list(params?: DevelopmentListParams): Promise<ApiEnvelope<Achievement[]>> {
    return api.get<ApiEnvelope<Achievement[]>>(DEVELOPMENT.ACHIEVEMENTS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Achievement>> {
    return api.get<ApiEnvelope<Achievement>>(`${DEVELOPMENT.ACHIEVEMENTS}/${id}`);
  },

  async create(payload: CreateAchievementPayload): Promise<ApiEnvelope<Achievement>> {
    return api.post<ApiEnvelope<Achievement>>(DEVELOPMENT.ACHIEVEMENTS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateAchievementPayload,
  ): Promise<ApiEnvelope<Achievement>> {
    return api.put<ApiEnvelope<Achievement>>(
      `${DEVELOPMENT.ACHIEVEMENTS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${DEVELOPMENT.ACHIEVEMENTS}/${id}`);
  },
};
