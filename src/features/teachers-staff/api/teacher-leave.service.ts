import { api } from "@/lib/api";
import { STAFF } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateTeacherLeavePayload,
  TeacherLeave,
  TeacherListParams,
  UpdateTeacherLeavePayload,
} from "./types";

export const teacherLeaveService = {
  async list(params?: TeacherListParams): Promise<ApiEnvelope<TeacherLeave[]>> {
    return api.get<ApiEnvelope<TeacherLeave[]>>(STAFF.TEACHER_LEAVES, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<TeacherLeave>> {
    return api.get<ApiEnvelope<TeacherLeave>>(`${STAFF.TEACHER_LEAVES}/${id}`);
  },

  async create(payload: CreateTeacherLeavePayload): Promise<ApiEnvelope<TeacherLeave>> {
    return api.post<ApiEnvelope<TeacherLeave>>(STAFF.TEACHER_LEAVES, payload);
  },

  async update(
    id: number | string,
    payload: UpdateTeacherLeavePayload,
  ): Promise<ApiEnvelope<TeacherLeave>> {
    return api.put<ApiEnvelope<TeacherLeave>>(
      `${STAFF.TEACHER_LEAVES}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${STAFF.TEACHER_LEAVES}/${id}`);
  },
};
