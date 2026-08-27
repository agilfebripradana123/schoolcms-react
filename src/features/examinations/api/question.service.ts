import { api } from "@/lib/api";
import { EXAMINATION } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateQuestionPayload,
  ExaminationListParams,
  QuestionBank,
  UpdateQuestionPayload,
} from "./types";

export const questionBankService = {
  async list(params?: ExaminationListParams): Promise<ApiEnvelope<QuestionBank[]>> {
    return api.get<ApiEnvelope<QuestionBank[]>>(EXAMINATION.QUESTIONS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<QuestionBank>> {
    return api.get<ApiEnvelope<QuestionBank>>(`${EXAMINATION.QUESTIONS}/${id}`);
  },

  async create(payload: CreateQuestionPayload): Promise<ApiEnvelope<QuestionBank>> {
    return api.post<ApiEnvelope<QuestionBank>>(EXAMINATION.QUESTIONS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateQuestionPayload,
  ): Promise<ApiEnvelope<QuestionBank>> {
    return api.put<ApiEnvelope<QuestionBank>>(`${EXAMINATION.QUESTIONS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${EXAMINATION.QUESTIONS}/${id}`);
  },
};
