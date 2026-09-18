import { api } from "@/lib/api";
import { EXAMINATION } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AddExamQuestionPayload,
  ExamQuestion,
  UpdateExamQuestionPayload,
} from "./types";

/** Endpoint helper: replace the {exam} placeholder. */
function examQuestionsUrl(examId: number | string, suffix = ""): string {
  const base = EXAMINATION.EXAM_QUESTIONS.replace("{exam}", String(examId));
  return suffix ? `${base}${suffix}` : base;
}

export const examQuestionService = {
  async list(examId: number | string): Promise<ApiEnvelope<ExamQuestion[]>> {
    return api.get<ApiEnvelope<ExamQuestion[]>>(examQuestionsUrl(examId));
  },

  async add(
    examId: number | string,
    payload: AddExamQuestionPayload,
  ): Promise<ApiEnvelope<ExamQuestion>> {
    return api.post<ApiEnvelope<ExamQuestion>>(examQuestionsUrl(examId), payload);
  },

  async update(
    examId: number | string,
    examQuestionId: number | string,
    payload: UpdateExamQuestionPayload,
  ): Promise<ApiEnvelope<ExamQuestion>> {
    return api.patch<ApiEnvelope<ExamQuestion>>(
      `${examQuestionsUrl(examId)}/${examQuestionId}`,
      payload,
    );
  },

  async remove(
    examId: number | string,
    examQuestionId: number | string,
  ): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${examQuestionsUrl(examId)}/${examQuestionId}`);
  },

  async reorder(
    examId: number | string,
    ordered: number[],
  ): Promise<ApiEnvelope<ExamQuestion[]>> {
    const base = EXAMINATION.EXAM_QUESTIONS_REORDER.replace("{exam}", String(examId));
    return api.put<ApiEnvelope<ExamQuestion[]>>(base, { ordered });
  },
};