import { api } from "@/lib/api";
import { EXAMINATION } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateExamParticipantPayload,
  ExaminationListParams,
  ExaminationPaginatedResponse,
  ExamParticipant,
  UpdateExamParticipantPayload,
} from "./types";

export const examParticipantService = {
  async list(
    params?: ExaminationListParams,
  ): Promise<ExaminationPaginatedResponse<ExamParticipant[]>> {
    return api.get<ExaminationPaginatedResponse<ExamParticipant[]>>(
      EXAMINATION.EXAM_PARTICIPANTS,
      params,
    );
  },

  async get(id: number | string): Promise<ApiEnvelope<ExamParticipant>> {
    return api.get<ApiEnvelope<ExamParticipant>>(
      `${EXAMINATION.EXAM_PARTICIPANTS}/${id}`,
    );
  },

  async create(
    payload: CreateExamParticipantPayload,
  ): Promise<ApiEnvelope<ExamParticipant>> {
    return api.post<ApiEnvelope<ExamParticipant>>(
      EXAMINATION.EXAM_PARTICIPANTS,
      payload,
    );
  },

  async update(
    id: number | string,
    payload: UpdateExamParticipantPayload,
  ): Promise<ApiEnvelope<ExamParticipant>> {
    return api.put<ApiEnvelope<ExamParticipant>>(
      `${EXAMINATION.EXAM_PARTICIPANTS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${EXAMINATION.EXAM_PARTICIPANTS}/${id}`);
  },
};
