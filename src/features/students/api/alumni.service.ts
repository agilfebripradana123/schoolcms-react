import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  Alumni,
  CreateAlumniPayload,
  StudentListParams,
  UpdateAlumniPayload,
} from "./types";

export const alumniService = {
  async list(params?: StudentListParams): Promise<ApiEnvelope<Alumni[]>> {
    return api.get<ApiEnvelope<Alumni[]>>(STUDENTS.ALUMNI, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Alumni>> {
    return api.get<ApiEnvelope<Alumni>>(`${STUDENTS.ALUMNI}/${id}`);
  },

  async create(payload: CreateAlumniPayload): Promise<ApiEnvelope<Alumni>> {
    return api.post<ApiEnvelope<Alumni>>(STUDENTS.ALUMNI, payload);
  },

  async update(
    id: number | string,
    payload: UpdateAlumniPayload,
  ): Promise<ApiEnvelope<Alumni>> {
    return api.put<ApiEnvelope<Alumni>>(`${STUDENTS.ALUMNI}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${STUDENTS.ALUMNI}/${id}`);
  },
};
