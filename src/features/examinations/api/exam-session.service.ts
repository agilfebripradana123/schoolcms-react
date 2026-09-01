import { api } from "@/lib/api";
import { EXAMINATION } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateExamSessionPayload,
  ExamSession,
  ExaminationListParams,
  ExaminationPaginatedResponse,
  UpdateExamSessionPayload,
} from "./types";

export const examSessionService = {
  async list(
    params?: ExaminationListParams,
  ): Promise<ExaminationPaginatedResponse<ExamSession[]>> {
    return api.get<ExaminationPaginatedResponse<ExamSession[]>>(
      EXAMINATION.EXAM_SESSIONS,
      params,
    );
  },

  async get(id: number | string): Promise<ApiEnvelope<ExamSession>> {
    return api.get<ApiEnvelope<ExamSession>>(`${EXAMINATION.EXAM_SESSIONS}/${id}`);
  },

  async create(payload: CreateExamSessionPayload): Promise<ApiEnvelope<ExamSession>> {
    return api.post<ApiEnvelope<ExamSession>>(EXAMINATION.EXAM_SESSIONS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateExamSessionPayload,
  ): Promise<ApiEnvelope<ExamSession>> {
    return api.put<ApiEnvelope<ExamSession>>(
      `${EXAMINATION.EXAM_SESSIONS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${EXAMINATION.EXAM_SESSIONS}/${id}`);
  },
};
