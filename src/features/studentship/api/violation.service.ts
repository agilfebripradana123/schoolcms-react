import { api } from "@/lib/api";
import { DEVELOPMENT } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateViolationPayload,
  UpdateViolationPayload,
  Violation,
} from "./types";

export const violationService = {
  async list(params?: Record<string, string | number | boolean | null | undefined>): Promise<ApiEnvelope<Violation[]>> {
    return api.get<ApiEnvelope<Violation[]>>(DEVELOPMENT.VIOLATIONS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Violation>> {
    return api.get<ApiEnvelope<Violation>>(`${DEVELOPMENT.VIOLATIONS}/${id}`);
  },

  async create(payload: CreateViolationPayload): Promise<ApiEnvelope<Violation>> {
    return api.post<ApiEnvelope<Violation>>(DEVELOPMENT.VIOLATIONS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateViolationPayload,
  ): Promise<ApiEnvelope<Violation>> {
    return api.put<ApiEnvelope<Violation>>(
      `${DEVELOPMENT.VIOLATIONS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${DEVELOPMENT.VIOLATIONS}/${id}`);
  },
};