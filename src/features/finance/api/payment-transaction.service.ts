import { api } from "@/lib/api";
import { FINANCE } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreatePaymentTransactionPayload,
  FinanceListParams,
  PaymentTransaction,
  UpdatePaymentTransactionPayload,
} from "./types";

export const paymentTransactionService = {
  async list(
    params?: FinanceListParams,
  ): Promise<ApiEnvelope<PaymentTransaction[]>> {
    return api.get<ApiEnvelope<PaymentTransaction[]>>(
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
