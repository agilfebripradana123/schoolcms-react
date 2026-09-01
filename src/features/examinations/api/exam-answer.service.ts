import { api } from "@/lib/api";
import { EXAMINATION } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateExamAnswerPayload,
  ExaminationListParams,
  ExaminationPaginatedResponse,
  ExamAnswer,
  UpdateExamAnswerPayload,
} from "./types";

export const examAnswerService = {
  async list(
    params?: ExaminationListParams,
  ): Promise<ExaminationPaginatedResponse<ExamAnswer[]>> {
    return api.get<ExaminationPaginatedResponse<ExamAnswer[]>>(
      EXAMINATION.EXAM_ANSWERS,
      params,
    );
  },

  async get(id: number | string): Promise<ApiEnvelope<ExamAnswer>> {
    return api.get<ApiEnvelope<ExamAnswer>>(`${EXAMINATION.EXAM_ANSWERS}/${id}`);
  },

  async create(payload: CreateExamAnswerPayload): Promise<ApiEnvelope<ExamAnswer>> {
    return api.post<ApiEnvelope<ExamAnswer>>(EXAMINATION.EXAM_ANSWERS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateExamAnswerPayload,
  ): Promise<ApiEnvelope<ExamAnswer>> {
    return api.put<ApiEnvelope<ExamAnswer>>(
      `${EXAMINATION.EXAM_ANSWERS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${EXAMINATION.EXAM_ANSWERS}/${id}`);
  },
};
