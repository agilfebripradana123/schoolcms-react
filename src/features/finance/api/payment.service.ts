import { api } from "@/lib/api";
import { FINANCE } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreatePaymentPayload,
  FinanceListParams,
  Payment,
  UpdatePaymentPayload,
} from "./types";

export const paymentService = {
  async list(params?: FinanceListParams): Promise<ApiEnvelope<Payment[]>> {
    return api.get<ApiEnvelope<Payment[]>>(FINANCE.PAYMENTS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Payment>> {
    return api.get<ApiEnvelope<Payment>>(`${FINANCE.PAYMENTS}/${id}`);
  },

  async create(payload: CreatePaymentPayload): Promise<ApiEnvelope<Payment>> {
    return api.post<ApiEnvelope<Payment>>(FINANCE.PAYMENTS, payload);
  },

  async update(
    id: number | string,
    payload: UpdatePaymentPayload,
  ): Promise<ApiEnvelope<Payment>> {
    return api.put<ApiEnvelope<Payment>>(`${FINANCE.PAYMENTS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${FINANCE.PAYMENTS}/${id}`);
  },
};
