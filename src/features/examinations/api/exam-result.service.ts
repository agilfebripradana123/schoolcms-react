import { api } from "@/lib/api";
import { EXAMINATION } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateExamResultPayload,
  ExaminationListParams,
  ExamResult,
  UpdateExamResultPayload,
} from "./types";

export const examResultService = {
  async list(params?: ExaminationListParams): Promise<ApiEnvelope<ExamResult[]>> {
    return api.get<ApiEnvelope<ExamResult[]>>(EXAMINATION.EXAM_RESULTS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<ExamResult>> {
    return api.get<ApiEnvelope<ExamResult>>(`${EXAMINATION.EXAM_RESULTS}/${id}`);
  },

  async create(payload: CreateExamResultPayload): Promise<ApiEnvelope<ExamResult>> {
    return api.post<ApiEnvelope<ExamResult>>(EXAMINATION.EXAM_RESULTS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateExamResultPayload,
  ): Promise<ApiEnvelope<ExamResult>> {
    return api.put<ApiEnvelope<ExamResult>>(
      `${EXAMINATION.EXAM_RESULTS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${EXAMINATION.EXAM_RESULTS}/${id}`);
  },
};
