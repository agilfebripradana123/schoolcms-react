import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AcademicListParams,
  CreatePeriodPayload,
  Period,
  UpdatePeriodPayload,
} from "./types";

export interface PeriodListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PeriodListResponse {
  success: boolean;
  message: string;
  data: Period[];
  meta: PeriodListMeta;
}

export const periodService = {
  async list(params?: AcademicListParams): Promise<PeriodListResponse> {
    return api.get<PeriodListResponse>(ACADEMIC.PERIODS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Period>> {
    return api.get<ApiEnvelope<Period>>(`${ACADEMIC.PERIODS}/${id}`);
  },

  async create(payload: CreatePeriodPayload): Promise<ApiEnvelope<Period>> {
    return api.post<ApiEnvelope<Period>>(ACADEMIC.PERIODS, payload);
  },

  async update(
    id: number | string,
    payload: UpdatePeriodPayload,
  ): Promise<ApiEnvelope<Period>> {
    return api.put<ApiEnvelope<Period>>(`${ACADEMIC.PERIODS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${ACADEMIC.PERIODS}/${id}`);
  },
};
