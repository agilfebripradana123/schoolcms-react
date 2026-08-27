import { api } from "@/lib/api";
import { STAFF } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateTeacherDocumentPayload,
  TeacherDocument,
  TeacherListParams,
  UpdateTeacherDocumentPayload,
} from "./types";

export const teacherDocumentService = {
  async list(params?: TeacherListParams): Promise<ApiEnvelope<TeacherDocument[]>> {
    return api.get<ApiEnvelope<TeacherDocument[]>>(
      STAFF.TEACHER_DOCUMENTS,
      params,
    );
  },

  async get(id: number | string): Promise<ApiEnvelope<TeacherDocument>> {
    return api.get<ApiEnvelope<TeacherDocument>>(
      `${STAFF.TEACHER_DOCUMENTS}/${id}`,
    );
  },

  async create(
    payload: CreateTeacherDocumentPayload,
  ): Promise<ApiEnvelope<TeacherDocument>> {
    return api.post<ApiEnvelope<TeacherDocument>>(STAFF.TEACHER_DOCUMENTS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateTeacherDocumentPayload,
  ): Promise<ApiEnvelope<TeacherDocument>> {
    return api.put<ApiEnvelope<TeacherDocument>>(
      `${STAFF.TEACHER_DOCUMENTS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${STAFF.TEACHER_DOCUMENTS}/${id}`);
  },
};
