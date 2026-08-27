import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AcademicListParams,
  ClassSubject,
  CreateClassSubjectPayload,
  UpdateClassSubjectPayload,
} from "./types";

export const classSubjectService = {
  async list(params?: AcademicListParams): Promise<ApiEnvelope<ClassSubject[]>> {
    return api.get<ApiEnvelope<ClassSubject[]>>(ACADEMIC.CLASS_SUBJECTS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<ClassSubject>> {
    return api.get<ApiEnvelope<ClassSubject>>(
      `${ACADEMIC.CLASS_SUBJECTS}/${id}`,
    );
  },

  async create(payload: CreateClassSubjectPayload): Promise<ApiEnvelope<ClassSubject>> {
    return api.post<ApiEnvelope<ClassSubject>>(ACADEMIC.CLASS_SUBJECTS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateClassSubjectPayload,
  ): Promise<ApiEnvelope<ClassSubject>> {
    return api.put<ApiEnvelope<ClassSubject>>(
      `${ACADEMIC.CLASS_SUBJECTS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${ACADEMIC.CLASS_SUBJECTS}/${id}`);
  },
};
