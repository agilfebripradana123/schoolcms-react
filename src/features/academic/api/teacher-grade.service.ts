import { api } from "@/lib/api";
import { TEACHER } from "@/lib/api/endpoints";
import type { ApiEnvelope, ApiMessage, ListParams } from "@/types";
import type {
  GradeType,
  TeacherGradeBulkPayload,
  TeacherGradeRoster,
} from "./types";

export interface TeacherGradeRosterParams extends ListParams {
  class_id: number;
  subject_id: number;
  type: GradeType;
  semester: string;
  academic_year?: string;
  academic_year_id?: number;
}

/**
 * Teacher self-service: Nilai (Portal Guru).
 * Semua data scope ditentukan backend dari user login (TeacherAssignment),
 * bukan parameter teacher_id dari client.
 */
export const teacherGradeService = {
  async roster(
    params: TeacherGradeRosterParams,
  ): Promise<ApiEnvelope<TeacherGradeRoster>> {
    return api.get<ApiEnvelope<TeacherGradeRoster>>(TEACHER.GRADES, params);
  },

  async bulkSave(payload: TeacherGradeBulkPayload): Promise<ApiMessage> {
    return api.post<ApiMessage>(TEACHER.GRADES_BULK, payload);
  },
};
