import { api } from "@/lib/api";
import { TEACHER } from "@/lib/api/endpoints";
import type { ApiEnvelope } from "@/types";
import type {
  TeacherClass,
  TeacherClassStudent,
  TeacherClassStudentsListParams,
} from "./types";

export interface TeacherClassStudentsListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface TeacherClassStudentsListResponse {
  success: boolean;
  message: string;
  data: TeacherClassStudent[];
  meta?: TeacherClassStudentsListMeta;
}

/**
 * Teacher self-service: Kelas & Siswa (Portal Guru).
 * Menghubungi endpoint `/api/teacher/*` yang menentukan scope dari user login
 * (bukan parameter teacher_id dari client).
 */
export const teacherClassService = {
  async list(): Promise<ApiEnvelope<TeacherClass[]>> {
    return api.get<ApiEnvelope<TeacherClass[]>>(TEACHER.CLASSES);
  },

  async listStudents(
    classId: number | string,
    params?: TeacherClassStudentsListParams,
  ): Promise<TeacherClassStudentsListResponse> {
    const url = TEACHER.CLASS_STUDENTS.replace("{classId}", String(classId));
    return api.get<TeacherClassStudentsListResponse>(url, params);
  },
};
