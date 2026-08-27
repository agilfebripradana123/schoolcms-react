import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AcademicListParams,
  ClassStudent,
  CreateClassStudentPayload,
  UpdateClassStudentPayload,
} from "./types";

export const classStudentService = {
  async list(params?: AcademicListParams): Promise<ApiEnvelope<ClassStudent[]>> {
    return api.get<ApiEnvelope<ClassStudent[]>>(ACADEMIC.CLASS_STUDENTS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<ClassStudent>> {
    return api.get<ApiEnvelope<ClassStudent>>(
      `${ACADEMIC.CLASS_STUDENTS}/${id}`,
    );
  },

  async create(payload: CreateClassStudentPayload): Promise<ApiEnvelope<ClassStudent>> {
    return api.post<ApiEnvelope<ClassStudent>>(ACADEMIC.CLASS_STUDENTS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateClassStudentPayload,
  ): Promise<ApiEnvelope<ClassStudent>> {
    return api.put<ApiEnvelope<ClassStudent>>(
      `${ACADEMIC.CLASS_STUDENTS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${ACADEMIC.CLASS_STUDENTS}/${id}`);
  },
};
