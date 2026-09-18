import { api } from "@/lib/api";
import { TEACHER } from "@/lib/api/endpoints";
import type { ApiEnvelope } from "@/types";
import type {
  GradeEssayPayload,
  GradeEssayResponse,
  GradeSyncResultData,
  TeacherEssayGradingData,
} from "./types";

/**
 * Teacher self-service: manual essay grading + grade sync (Portal Guru).
 *
 * Endpoints `/api/teacher/exam-grading/*` — teacher scope (mata pelajaran yang
 * diajar) ditentukan backend dari user login + TeacherAssignment; client tidak
 * mengirim teacher_id / boundaries keamanan.
 */
export const teacherExamGradingService = {
  async getAttempt(
    attemptId: number | string,
  ): Promise<ApiEnvelope<TeacherEssayGradingData>> {
    return api.get<ApiEnvelope<TeacherEssayGradingData>>(
      TEACHER.EXAM_GRADING_ATTEMPTS.replace("{attempt}", String(attemptId)),
    );
  },

  async gradeEssay(
    examAnswerId: number | string,
    payload: GradeEssayPayload,
  ): Promise<ApiEnvelope<GradeEssayResponse>> {
    return api.put<ApiEnvelope<GradeEssayResponse>>(
      TEACHER.EXAM_GRADING_ANSWERS.replace("{examAnswer}", String(examAnswerId)),
      payload,
    );
  },

  async syncGrade(
    resultId: number | string,
  ): Promise<ApiEnvelope<GradeSyncResultData>> {
    return api.post<ApiEnvelope<GradeSyncResultData>>(
      TEACHER.EXAM_GRADING_RESULTS_SYNC.replace("{result}", String(resultId)),
    );
  },
};