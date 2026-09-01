import { api } from "@/lib/api";
import { FINANCE } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  Billing,
  CreateBillingPayload,
  FinanceListParams,
  UpdateBillingPayload,
} from "./types";

export interface BillingListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface BillingListResponse {
  success: boolean;
  message: string;
  data: Billing[];
  meta: BillingListMeta;
}

export const billingService = {
  async list(params?: FinanceListParams): Promise<BillingListResponse> {
    return api.get<BillingListResponse>(FINANCE.BILLINGS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Billing>> {
    return api.get<ApiEnvelope<Billing>>(`${FINANCE.BILLINGS}/${id}`);
  },

  async create(payload: CreateBillingPayload): Promise<ApiEnvelope<Billing>> {
    return api.post<ApiEnvelope<Billing>>(FINANCE.BILLINGS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateBillingPayload,
  ): Promise<ApiEnvelope<Billing>> {
    return api.put<ApiEnvelope<Billing>>(`${FINANCE.BILLINGS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${FINANCE.BILLINGS}/${id}`);
  },
};