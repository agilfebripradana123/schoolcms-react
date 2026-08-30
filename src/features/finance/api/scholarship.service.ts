import { api } from "@/lib/api";
import { FINANCE } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateScholarshipPayload,
  FinanceListParams,
  Scholarship,
  UpdateScholarshipPayload,
} from "./types";

export interface ScholarshipListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ScholarshipListResponse {
  success: boolean;
  message: string;
  data: Scholarship[];
  meta: ScholarshipListMeta;
}

export const scholarshipService = {
  async list(params?: FinanceListParams): Promise<ScholarshipListResponse> {
    return api.get<ScholarshipListResponse>(FINANCE.SCHOLARSHIPS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Scholarship>> {
    return api.get<ApiEnvelope<Scholarship>>(`${FINANCE.SCHOLARSHIPS}/${id}`);
  },

  async create(payload: CreateScholarshipPayload): Promise<ApiEnvelope<Scholarship>> {
    return api.post<ApiEnvelope<Scholarship>>(FINANCE.SCHOLARSHIPS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateScholarshipPayload,
  ): Promise<ApiEnvelope<Scholarship>> {
    return api.put<ApiEnvelope<Scholarship>>(
      `${FINANCE.SCHOLARSHIPS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${FINANCE.SCHOLARSHIPS}/${id}`);
  },
};