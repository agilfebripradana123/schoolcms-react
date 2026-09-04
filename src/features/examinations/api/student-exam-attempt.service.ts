import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import type { ApiEnvelope } from "@/types";
import type { QuestionType } from "./types";

// ---------------------------------------------------------------------
// Secure Web Exam — student attempt (Phase 10 backend, Phase 11 UI).
// Do NOT put any scoring/answer-key computation here. The server is the
// source of truth for timer, attempt, scoring, and ownership.
// ---------------------------------------------------------------------

export type ExamAttemptStatus = "active" | "submitted" | "expired";

export interface ExamAttemptInfo {
  id: number;
  attempt_number: number;
  status: ExamAttemptStatus;
  started_at: string | null;
  expires_at: string | null;
  submitted_at: string | null;
  server_now: string | null;
  exam_id: number;
}

export interface SecureExamOption {
  id: number;
  option_text: string;
  option_image?: string | null;
}

export interface SecureExamQuestion {
  id: number;
  question_text: string;
  question_image?: string | null;
  type: QuestionType;
  difficulty: string;
  points: number;
  options: SecureExamOption[];
}

export interface SecureExamQuestionsData {
  attempt: ExamAttemptInfo;
  questions: SecureExamQuestion[];
}

export interface SavedAnswer {
  question_id: number;
  selected_option_id: number | null;
  essay_answer: string | null;
  answered_at: string | null;
}

export type AttemptAnswersMap = Record<
  string,
  { selected_option_id: number | null; essay_answer: string | null }
>;

export interface SecureExamAttemptData {
  attempt: ExamAttemptInfo;
  answers: AttemptAnswersMap;
}

export interface SecureExamSubmitData {
  attempt: ExamAttemptInfo;
  result: {
    total_score: number;
    correct_count: number;
    wrong_count: number;
    unanswered_count: number;
    grade: string | null;
    status: string;
  };
}

const BASE = STUDENTS.EXAM_ATTEMPTS;

export const studentExamAttemptService = {
  async start(examId: number): Promise<ApiEnvelope<ExamAttemptInfo>> {
    return api.post<ApiEnvelope<ExamAttemptInfo>>(STUDENTS.EXAM_ATTEMPTS_START, {
      exam_id: examId,
    });
  },

  async getAttempt(attemptId: number | string): Promise<ApiEnvelope<SecureExamAttemptData>> {
    return api.get<ApiEnvelope<SecureExamAttemptData>>(`${BASE}/${attemptId}`);
  },

  async getQuestions(
    attemptId: number | string,
  ): Promise<ApiEnvelope<SecureExamQuestionsData>> {
    return api.get<ApiEnvelope<SecureExamQuestionsData>>(
      `${BASE}/${attemptId}/questions`,
    );
  },

  async saveAnswer(
    attemptId: number | string,
    questionId: number,
    payload: { selected_option_id?: number | null; essay_answer?: string | null },
  ): Promise<ApiEnvelope<SavedAnswer>> {
    return api.put<ApiEnvelope<SavedAnswer>>(
      `${BASE}/${attemptId}/answers/${questionId}`,
      payload,
    );
  },

  async submit(
    attemptId: number | string,
  ): Promise<ApiEnvelope<SecureExamSubmitData>> {
    return api.post<ApiEnvelope<SecureExamSubmitData>>(
      `${BASE}/${attemptId}/submit`,
    );
  },

  async logEvent(
    attemptId: number | string,
    payload: { event_type: string; metadata?: Record<string, unknown> },
  ): Promise<ApiEnvelope<{ event_type: string; occurred_at: string }>> {
    return api.post<ApiEnvelope<{ event_type: string; occurred_at: string }>>(
      `${BASE}/${attemptId}/events`,
      payload,
    );
  },
};
