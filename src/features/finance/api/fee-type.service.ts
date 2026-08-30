import { api } from "@/lib/api";
import { FINANCE } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateFeeTypePayload,
  FeeType,
  FinanceListParams,
  UpdateFeeTypePayload,
} from "./types";

export interface FeeTypeListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface FeeTypeListResponse {
  success: boolean;
  message: string;
  data: FeeType[];
  meta: FeeTypeListMeta;
}

export const feeTypeService = {
  async list(params?: FinanceListParams): Promise<FeeTypeListResponse> {
    return api.get<FeeTypeListResponse>(FINANCE.FEE_TYPES, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<FeeType>> {
    return api.get<ApiEnvelope<FeeType>>(`${FINANCE.FEE_TYPES}/${id}`);
  },

  async create(payload: CreateFeeTypePayload): Promise<ApiEnvelope<FeeType>> {
    return api.post<ApiEnvelope<FeeType>>(FINANCE.FEE_TYPES, payload);
  },

  async update(
    id: number | string,
    payload: UpdateFeeTypePayload,
  ): Promise<ApiEnvelope<FeeType>> {
    return api.put<ApiEnvelope<FeeType>>(`${FINANCE.FEE_TYPES}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${FINANCE.FEE_TYPES}/${id}`);
  },
};