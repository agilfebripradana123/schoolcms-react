import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type { AcademicListParams } from "./types";

export interface TeacherAssignment {
  id: number;
  teacher_id?: number;
  class_id?: number;
  subject_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTeacherAssignmentPayload {
  teacher_id?: number;
  class_id?: number;
  subject_id?: number;
}

export interface UpdateTeacherAssignmentPayload
  extends Partial<CreateTeacherAssignmentPayload> {}

export const teacherAssignmentService = {
  async list(
    params?: AcademicListParams,
  ): Promise<ApiEnvelope<TeacherAssignment[]>> {
    return api.get<ApiEnvelope<TeacherAssignment[]>>(
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
