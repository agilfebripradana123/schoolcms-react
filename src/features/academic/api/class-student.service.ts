import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  ClassStudent,
  ClassStudentStatus,
  CreateClassStudentPayload,
  UpdateClassStudentPayload,
} from "./types";

export interface ClassStudentListParams {
  class_id?: number;
  student_id?: number;
  academic_year_id?: number;
  status?: ClassStudentStatus;
  page?: number;
  per_page?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface ClassStudentListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ClassStudentListResponse {
  success: boolean;
  message: string;
  data: ClassStudent[];
  meta: ClassStudentListMeta;
}

export const classStudentService = {
  async list(
    params?: ClassStudentListParams,
  ): Promise<ClassStudentListResponse> {
    return api.get<ClassStudentListResponse>(ACADEMIC.CLASS_STUDENTS, params);
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
