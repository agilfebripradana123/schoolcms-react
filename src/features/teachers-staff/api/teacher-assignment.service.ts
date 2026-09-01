import { api } from "@/lib/api";
import { STAFF } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateTeacherAssignmentPayload,
  TeacherAssignment,
  TeacherListParams,
  UpdateTeacherAssignmentPayload,
} from "./types";

export const teacherAssignmentService = {
  async list(
    params?: TeacherListParams,
  ): Promise<ApiEnvelope<TeacherAssignment[]>> {
    return api.get<ApiEnvelope<TeacherAssignment[]>>(STAFF.TEACHER_ASSIGNMENTS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<TeacherAssignment>> {
    return api.get<ApiEnvelope<TeacherAssignment>>(
      `${STAFF.TEACHER_ASSIGNMENTS}/${id}`,
    );
  },

  async create(
    payload: CreateTeacherAssignmentPayload,
  ): Promise<ApiEnvelope<TeacherAssignment>> {
    return api.post<ApiEnvelope<TeacherAssignment>>(
      STAFF.TEACHER_ASSIGNMENTS,
      payload,
    );
  },

  async update(
    id: number | string,
    payload: UpdateTeacherAssignmentPayload,
  ): Promise<ApiEnvelope<TeacherAssignment>> {
    return api.put<ApiEnvelope<TeacherAssignment>>(
      `${STAFF.TEACHER_ASSIGNMENTS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${STAFF.TEACHER_ASSIGNMENTS}/${id}`);
  },
};
