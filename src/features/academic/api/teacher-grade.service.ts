import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import { TEACHER } from "@/lib/api/endpoints";
import type { ApiEnvelope, ApiMessage, ListParams } from "@/types";
import type {
  GradeType,
  TeacherGradeBulkPayload,
  TeacherGradeRoster,
} from "./types";

export interface GradeResource {
  id: number;
  student_id: number;
  score: number | null;
  is_final: boolean;
  finalized_at: string | null;
  finalized_by: number | null;
}

export interface TeacherGradeRosterParams extends ListParams {
  class_id: number;
  subject_id: number;
  type: GradeType;
  semester_id: number;
  academic_year_id: number;
  semester?: string;
  academic_year?: string;
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

  async finalize(gradeId: number): Promise<ApiEnvelope<GradeResource>> {
    return api.post<ApiEnvelope<GradeResource>>(`${ACADEMIC.GRADES}/${gradeId}/finalize`);
  },

  async unfinalize(gradeId: number): Promise<ApiEnvelope<GradeResource>> {
    return api.post<ApiEnvelope<GradeResource>>(`${ACADEMIC.GRADES}/${gradeId}/unfinalize`);
  },
};
