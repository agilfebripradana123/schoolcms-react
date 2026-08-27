import { api } from "@/lib/api";
import { EXAMINATION } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateExamInstructionPayload,
  ExamInstruction,
  ExaminationListParams,
  UpdateExamInstructionPayload,
} from "./types";

export const examInstructionService = {
  async list(params?: ExaminationListParams): Promise<ApiEnvelope<ExamInstruction[]>> {
    return api.get<ApiEnvelope<ExamInstruction[]>>(
      EXAMINATION.EXAM_INSTRUCTIONS,
      params,
    );
  },

  async get(id: number | string): Promise<ApiEnvelope<ExamInstruction>> {
    return api.get<ApiEnvelope<ExamInstruction>>(
      `${EXAMINATION.EXAM_INSTRUCTIONS}/${id}`,
    );
  },

  async create(
    payload: CreateExamInstructionPayload,
  ): Promise<ApiEnvelope<ExamInstruction>> {
    return api.post<ApiEnvelope<ExamInstruction>>(EXAMINATION.EXAM_INSTRUCTIONS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateExamInstructionPayload,
  ): Promise<ApiEnvelope<ExamInstruction>> {
    return api.put<ApiEnvelope<ExamInstruction>>(
      `${EXAMINATION.EXAM_INSTRUCTIONS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${EXAMINATION.EXAM_INSTRUCTIONS}/${id}`);
  },
};
