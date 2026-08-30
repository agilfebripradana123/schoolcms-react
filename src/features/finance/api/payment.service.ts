import { api } from "@/lib/api";
import { FINANCE } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreatePaymentPayload,
  FinanceListParams,
  Payment,
  UpdatePaymentPayload,
} from "./types";

export interface PaymentListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaymentListResponse {
  success: boolean;
  message: string;
  data: Payment[];
  meta: PaymentListMeta;
}

export const paymentService = {
  async list(params?: FinanceListParams): Promise<PaymentListResponse> {
    return api.get<PaymentListResponse>(FINANCE.PAYMENTS, params);
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