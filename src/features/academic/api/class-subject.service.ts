import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  ClassSubject,
  CreateClassSubjectPayload,
  UpdateClassSubjectPayload,
} from "./types";

export interface ClassSubjectListParams {
  class_id?: number;
  subject_id?: number;
  teacher_id?: number;
  page?: number;
  per_page?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface ClassSubjectListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ClassSubjectListResponse {
  success: boolean;
  message: string;
  data: ClassSubject[];
  meta: ClassSubjectListMeta;
}

export const classSubjectService = {
  async list(
    params?: ClassSubjectListParams,
  ): Promise<ClassSubjectListResponse> {
    return api.get<ClassSubjectListResponse>(ACADEMIC.CLASS_SUBJECTS, params);
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
