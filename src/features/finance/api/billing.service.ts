import { api } from "@/lib/api";
import { FINANCE } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  Billing,
  CreateBillingPayload,
  FinanceListParams,
  UpdateBillingPayload,
} from "./types";

export const billingService = {
  async list(params?: FinanceListParams): Promise<ApiEnvelope<Billing[]>> {
    return api.get<ApiEnvelope<Billing[]>>(FINANCE.BILLINGS, params);
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
