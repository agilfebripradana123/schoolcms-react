import { api } from "@/lib/api";
import { TEACHER } from "@/lib/api/endpoints";
import type { ApiEnvelope, ListParams } from "@/types";
import type { ExaminationListMeta } from "./types";

export type ExamAttemptStatus = "active" | "submitted" | "expired";

export interface ExamAttemptMonitoring {
  id: number;
  attempt_number: number;
  status: ExamAttemptStatus;
  started_at: string | null;
  expires_at: string | null;
  submitted_at: string | null;
  remaining_seconds: number | null;
  exam: {
    id: number;
    title: string;
    subject: {
      id: number;
      name: string;
    };
  };
  student: {
    id: number;
    name: string;
    nis: string;
  };
  participant: {
    id: number;
    exam_card_number: string;
    is_blocked: boolean;
  };
  progress: {
    total_questions: number;
    answered: number;
    unanswered: number;
    percentage: number;
  };
  event_count: number;
}

export interface ExamAttemptEvent {
  id: number;
  event_type: string;
  occurred_at: string;
  metadata?: Record<string, unknown> | null;
}

export interface ExamAttemptDetail {
  attempt: ExamAttemptMonitoring;
  event_summary: Record<string, number>;
  event_timeline: ExamAttemptEvent[];
}

export interface ExamMonitoringListParams extends ListParams {
  exam_id?: number;
  status?: ExamAttemptStatus;
  search?: string;
}

interface ExamMonitoringListResponse {
  success: boolean;
  message: string;
  data: ExamAttemptMonitoring[];
  meta: ExaminationListMeta;
}

export const myExamMonitoringService = {
  async list(
    params?: ExamMonitoringListParams,
  ): Promise<ExamMonitoringListResponse> {
    return api.get<ExamMonitoringListResponse>(TEACHER.EXAM_MONITORING, params);
  },

  async get(attemptId: number | string): Promise<ApiEnvelope<ExamAttemptDetail>> {
    return api.get<ApiEnvelope<ExamAttemptDetail>>(
      `${TEACHER.EXAM_MONITORING}/${attemptId}`,
    );
  },
};
