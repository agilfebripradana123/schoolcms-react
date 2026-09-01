import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateTeacherAssignmentPayload,
  TeacherAssignment,
  UpdateTeacherAssignmentPayload,
} from "./types";

export interface TeacherAssignmentListParams {
  teacher_id?: number;
  class_id?: number;
  subject_id?: number;
  academic_year_id?: number;
  page?: number;
  per_page?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface TeacherAssignmentListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface TeacherAssignmentListResponse {
  success: boolean;
  message: string;
  data: TeacherAssignment[];
  meta: TeacherAssignmentListMeta;
}

export const teacherAssignmentService = {
  async list(
    params?: TeacherAssignmentListParams,
  ): Promise<TeacherAssignmentListResponse> {
    return api.get<TeacherAssignmentListResponse>(
      ACADEMIC.TEACHER_ASSIGNMENTS,
      params,
    );
  },

  async get(id: number | string): Promise<ApiEnvelope<TeacherAssignment>> {
    return api.get<ApiEnvelope<TeacherAssignment>>(
      `${ACADEMIC.TEACHER_ASSIGNMENTS}/${id}`,
    );
  },

  async create(
    payload: CreateTeacherAssignmentPayload,
  ): Promise<ApiEnvelope<TeacherAssignment>> {
    return api.post<ApiEnvelope<TeacherAssignment>>(
      ACADEMIC.TEACHER_ASSIGNMENTS,
      payload,
    );
  },

  async update(
    id: number | string,
    payload: UpdateTeacherAssignmentPayload,
  ): Promise<ApiEnvelope<TeacherAssignment>> {
    return api.put<ApiEnvelope<TeacherAssignment>>(
      `${ACADEMIC.TEACHER_ASSIGNMENTS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${ACADEMIC.TEACHER_ASSIGNMENTS}/${id}`);
  },
};
