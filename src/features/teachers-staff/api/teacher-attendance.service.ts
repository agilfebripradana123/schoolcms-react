import { api } from "@/lib/api";
import { STAFF } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateTeacherAttendancePayload,
  TeacherAttendance,
  TeacherListParams,
  UpdateTeacherAttendancePayload,
} from "./types";

export const teacherAttendanceService = {
  async list(
    params?: TeacherListParams,
  ): Promise<ApiEnvelope<TeacherAttendance[]>> {
    return api.get<ApiEnvelope<TeacherAttendance[]>>(
      STAFF.TEACHER_ATTENDANCES,
      params,
    );
  },

  async get(id: number | string): Promise<ApiEnvelope<TeacherAttendance>> {
    return api.get<ApiEnvelope<TeacherAttendance>>(
      `${STAFF.TEACHER_ATTENDANCES}/${id}`,
    );
  },

  async create(
    payload: CreateTeacherAttendancePayload,
  ): Promise<ApiEnvelope<TeacherAttendance>> {
    return api.post<ApiEnvelope<TeacherAttendance>>(
      STAFF.TEACHER_ATTENDANCES,
      payload,
    );
  },

  async update(
    id: number | string,
    payload: UpdateTeacherAttendancePayload,
  ): Promise<ApiEnvelope<TeacherAttendance>> {
    return api.put<ApiEnvelope<TeacherAttendance>>(
      `${STAFF.TEACHER_ATTENDANCES}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${STAFF.TEACHER_ATTENDANCES}/${id}`);
  },
};
