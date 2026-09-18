import { api } from "@/lib/api";
import { EXAMINATION, TEACHER } from "@/lib/api";
import type { ApiEnvelope } from "@/types";
import type { ExamQuestionReport, ExamReportData } from "./types";

export type ExamReportScope = "admin" | "teacher";

function base(scope: ExamReportScope): string {
  return scope === "teacher" ? TEACHER.EXAM_REPORTS : EXAMINATION.EXAM_REPORTS;
}

/**
 * Exam reporting (B15, read-only aggregates). Teacher scope is resolved
 * server-side from the teacher subject scope; admin uses manage-exams.
 */
export const examReportService = {
  async summary(examId: number | string, scope: ExamReportScope): Promise<ApiEnvelope<ExamReportData>> {
    return api.get<ApiEnvelope<ExamReportData>>(`${base(scope)}/${examId}`);
  },

  async questions(
    examId: number | string,
    scope: ExamReportScope,
  ): Promise<ApiEnvelope<ExamQuestionReport>> {
    return api.get<ApiEnvelope<ExamQuestionReport>>(`${base(scope)}/${examId}/questions`);
  },
};