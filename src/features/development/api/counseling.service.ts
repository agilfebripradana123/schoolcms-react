import { api } from "@/lib/api";
import { DEVELOPMENT } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  Counseling,
  CreateCounselingPayload,
  DevelopmentListParams,
  UpdateCounselingPayload,
} from "./types";

export const counselingService = {
  async list(params?: DevelopmentListParams): Promise<ApiEnvelope<Counseling[]>> {
    return api.get<ApiEnvelope<Counseling[]>>(DEVELOPMENT.COUNSELINGS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Counseling>> {
    return api.get<ApiEnvelope<Counseling>>(`${DEVELOPMENT.COUNSELINGS}/${id}`);
  },

  async create(payload: CreateCounselingPayload): Promise<ApiEnvelope<Counseling>> {
    return api.post<ApiEnvelope<Counseling>>(DEVELOPMENT.COUNSELINGS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateCounselingPayload,
  ): Promise<ApiEnvelope<Counseling>> {
    return api.put<ApiEnvelope<Counseling>>(
      `${DEVELOPMENT.COUNSELINGS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${DEVELOPMENT.COUNSELINGS}/${id}`);
  },
};
