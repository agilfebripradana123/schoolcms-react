import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateGuardianPayload,
  Guardian,
  StudentListParams,
  UpdateGuardianPayload,
} from "./types";

export const guardianService = {
  async list(params?: StudentListParams): Promise<ApiEnvelope<Guardian[]>> {
    return api.get<ApiEnvelope<Guardian[]>>(STUDENTS.GUARDIANS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Guardian>> {
    return api.get<ApiEnvelope<Guardian>>(`${STUDENTS.GUARDIANS}/${id}`);
  },

  async create(payload: CreateGuardianPayload): Promise<ApiEnvelope<Guardian>> {
    return api.post<ApiEnvelope<Guardian>>(STUDENTS.GUARDIANS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateGuardianPayload,
  ): Promise<ApiEnvelope<Guardian>> {
    return api.put<ApiEnvelope<Guardian>>(`${STUDENTS.GUARDIANS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${STUDENTS.GUARDIANS}/${id}`);
  },
};
