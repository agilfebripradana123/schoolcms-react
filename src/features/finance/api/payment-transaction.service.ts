import { api } from "@/lib/api";
import { FINANCE } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreatePaymentTransactionPayload,
  FinanceListParams,
  PaymentTransaction,
  UpdatePaymentTransactionPayload,
} from "./types";

export interface PaymentTransactionListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaymentTransactionListResponse {
  success: boolean;
  message: string;
  data: PaymentTransaction[];
  meta: PaymentTransactionListMeta;
}

export const paymentTransactionService = {
  async list(
    params?: FinanceListParams,
  ): Promise<PaymentTransactionListResponse> {
    return api.get<PaymentTransactionListResponse>(
      FINANCE.PAYMENT_TRANSACTIONS,
      params,
    );
  },

  async get(id: number | string): Promise<ApiEnvelope<PaymentTransaction>> {
    return api.get<ApiEnvelope<PaymentTransaction>>(
      `${FINANCE.PAYMENT_TRANSACTIONS}/${id}`,
    );
  },

  async create(
    payload: CreatePaymentTransactionPayload,
  ): Promise<ApiEnvelope<PaymentTransaction>> {
    return api.post<ApiEnvelope<PaymentTransaction>>(
      FINANCE.PAYMENT_TRANSACTIONS,
      payload,
    );
  },

  async update(
    id: number | string,
    payload: UpdatePaymentTransactionPayload,
  ): Promise<ApiEnvelope<PaymentTransaction>> {
    return api.put<ApiEnvelope<PaymentTransaction>>(
      `${FINANCE.PAYMENT_TRANSACTIONS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${FINANCE.PAYMENT_TRANSACTIONS}/${id}`);
  },
};