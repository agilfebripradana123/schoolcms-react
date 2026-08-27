import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AcademicListParams,
  CreateSubjectPayload,
  Subject,
  UpdateSubjectPayload,
} from "./types";

export const subjectService = {
  async list(params?: AcademicListParams): Promise<ApiEnvelope<Subject[]>> {
    return api.get<ApiEnvelope<Subject[]>>(ACADEMIC.SUBJECTS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Subject>> {
    return api.get<ApiEnvelope<Subject>>(`${ACADEMIC.SUBJECTS}/${id}`);
  },

  async create(payload: CreateSubjectPayload): Promise<ApiEnvelope<Subject>> {
    return api.post<ApiEnvelope<Subject>>(ACADEMIC.SUBJECTS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateSubjectPayload,
  ): Promise<ApiEnvelope<Subject>> {
    return api.put<ApiEnvelope<Subject>>(`${ACADEMIC.SUBJECTS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${ACADEMIC.SUBJECTS}/${id}`);
  },
};
