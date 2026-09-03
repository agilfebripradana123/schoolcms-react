import { api } from "@/lib/api";
import { TEACHER } from "@/lib/api/endpoints";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  TeacherAttendanceRoster,
  TeacherAttendanceSavePayload,
} from "./types";

/**
 * Teacher self-service: Kehadiran Siswa (Portal Guru).
 * Menghubungi /api/teacher/attendance — scope ditentukan backend dari user
 * login (TeacherAssignment), bukan parameter teacher_id dari client.
 */
export const teacherAttendanceService = {
  async roster(
    classId: number | string,
    date: string,
  ): Promise<ApiEnvelope<TeacherAttendanceRoster>> {
    return api.get<ApiEnvelope<TeacherAttendanceRoster>>(TEACHER.ATTENDANCE, {
      class_id: classId,
      date,
    });
  },

  async save(payload: TeacherAttendanceSavePayload): Promise<ApiMessage> {
    return api.post<ApiMessage>(TEACHER.ATTENDANCE, payload);
  },
};
