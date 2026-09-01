import { api } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  Attendance,
  CreateAttendancePayload,
  UpdateAttendancePayload,
} from "./types";

export const STUDENT_ATTENDANCES = "/attendance";

export const attendanceService = {
  async list(params?: {
    student_id?: number;
    date?: string;
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiEnvelope<Attendance[]>> {
    return api.get<ApiEnvelope<Attendance[]>>(STUDENT_ATTENDANCES, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Attendance>> {
    return api.get<ApiEnvelope<Attendance>>(`${STUDENT_ATTENDANCES}/${id}`);
  },

  async create(payload: CreateAttendancePayload): Promise<ApiEnvelope<Attendance>> {
    return api.post<ApiEnvelope<Attendance>>(STUDENT_ATTENDANCES, payload);
  },

  async update(
    id: number | string,
    payload: UpdateAttendancePayload,
  ): Promise<ApiEnvelope<Attendance>> {
    return api.put<ApiEnvelope<Attendance>>(`${STUDENT_ATTENDANCES}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${STUDENT_ATTENDANCES}/${id}`);
  },
};
