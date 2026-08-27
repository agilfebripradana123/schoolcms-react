import { api } from "@/lib/api";
import { EXAMINATION } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateExamPayload,
  Exam,
  ExaminationListParams,
  UpdateExamPayload,
} from "./types";

export const examService = {
  async list(params?: ExaminationListParams): Promise<ApiEnvelope<Exam[]>> {
    return api.get<ApiEnvelope<Exam[]>>(EXAMINATION.EXAMS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Exam>> {
    return api.get<ApiEnvelope<Exam>>(`${EXAMINATION.EXAMS}/${id}`);
  },

  async create(payload: CreateExamPayload): Promise<ApiEnvelope<Exam>> {
    return api.post<ApiEnvelope<Exam>>(EXAMINATION.EXAMS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateExamPayload,
  ): Promise<ApiEnvelope<Exam>> {
    return api.put<ApiEnvelope<Exam>>(`${EXAMINATION.EXAMS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${EXAMINATION.EXAMS}/${id}`);
  },
};
