import { api } from "@/lib/api";
import { TEACHER } from "@/lib/api/endpoints";
import type { ApiEnvelope } from "@/types";
import type { TeacherSchedule, TeacherScheduleListParams } from "./types";

/**
 * Teacher self-service: Jadwal Mengajar (Portal Guru).
 * Menghubungi /api/teacher/schedules — scope ditentukan backend dari user
 * login, bukan parameter teacher_id dari client.
 */
export const teacherScheduleService = {
  async list(
    params?: TeacherScheduleListParams,
  ): Promise<ApiEnvelope<TeacherSchedule[]>> {
    return api.get<ApiEnvelope<TeacherSchedule[]>>(TEACHER.SCHEDULES, params);
  },
};
