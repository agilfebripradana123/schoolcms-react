import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AcademicListParams,
  CreateSchedulePayload,
  Schedule,
  UpdateSchedulePayload,
} from "./types";

export interface ScheduleListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ScheduleListResponse {
  success: boolean;
  message: string;
  data: Schedule[];
  meta: ScheduleListMeta;
}

export const scheduleService = {
  async list(params?: AcademicListParams): Promise<ScheduleListResponse> {
    return api.get<ScheduleListResponse>(ACADEMIC.SCHEDULES, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Schedule>> {
    return api.get<ApiEnvelope<Schedule>>(`${ACADEMIC.SCHEDULES}/${id}`);
  },

  async create(payload: CreateSchedulePayload): Promise<ApiEnvelope<Schedule>> {
    return api.post<ApiEnvelope<Schedule>>(ACADEMIC.SCHEDULES, payload);
  },

  async update(
    id: number | string,
    payload: UpdateSchedulePayload,
  ): Promise<ApiEnvelope<Schedule>> {
    return api.put<ApiEnvelope<Schedule>>(
      `${ACADEMIC.SCHEDULES}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${ACADEMIC.SCHEDULES}/${id}`);
  },
};
