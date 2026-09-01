import { api } from "@/lib/api";
import { EXAMINATION } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateExamSchedulePayload,
  ExamSchedule,
  ExaminationListParams,
  ExaminationPaginatedResponse,
  UpdateExamSchedulePayload,
} from "./types";

export const examScheduleService = {
  async list(
    params?: ExaminationListParams,
  ): Promise<ExaminationPaginatedResponse<ExamSchedule[]>> {
    return api.get<ExaminationPaginatedResponse<ExamSchedule[]>>(
      EXAMINATION.EXAM_SCHEDULES,
      params,
    );
  },

  async get(id: number | string): Promise<ApiEnvelope<ExamSchedule>> {
    return api.get<ApiEnvelope<ExamSchedule>>(`${EXAMINATION.EXAM_SCHEDULES}/${id}`);
  },

  async create(
    payload: CreateExamSchedulePayload,
  ): Promise<ApiEnvelope<ExamSchedule>> {
    return api.post<ApiEnvelope<ExamSchedule>>(EXAMINATION.EXAM_SCHEDULES, payload);
  },

  async update(
    id: number | string,
    payload: UpdateExamSchedulePayload,
  ): Promise<ApiEnvelope<ExamSchedule>> {
    return api.put<ApiEnvelope<ExamSchedule>>(
      `${EXAMINATION.EXAM_SCHEDULES}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${EXAMINATION.EXAM_SCHEDULES}/${id}`);
  },
};
