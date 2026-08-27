import { api } from "@/lib/api";
import { DEVELOPMENT } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateExtracurricularPayload,
  DevelopmentListParams,
  Extracurricular,
  UpdateExtracurricularPayload,
} from "./types";

export const extracurricularService = {
  async list(
    params?: DevelopmentListParams,
  ): Promise<ApiEnvelope<Extracurricular[]>> {
    return api.get<ApiEnvelope<Extracurricular[]>>(
      DEVELOPMENT.EXTRACURRICULARS,
      params,
    );
  },

  async get(id: number | string): Promise<ApiEnvelope<Extracurricular>> {
    return api.get<ApiEnvelope<Extracurricular>>(
      `${DEVELOPMENT.EXTRACURRICULARS}/${id}`,
    );
  },

  async create(
    payload: CreateExtracurricularPayload,
  ): Promise<ApiEnvelope<Extracurricular>> {
    return api.post<ApiEnvelope<Extracurricular>>(
      DEVELOPMENT.EXTRACURRICULARS,
      payload,
    );
  },

  async update(
    id: number | string,
    payload: UpdateExtracurricularPayload,
  ): Promise<ApiEnvelope<Extracurricular>> {
    return api.put<ApiEnvelope<Extracurricular>>(
      `${DEVELOPMENT.EXTRACURRICULARS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${DEVELOPMENT.EXTRACURRICULARS}/${id}`);
  },
};
