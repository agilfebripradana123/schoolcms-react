import { api } from "@/lib/api";
import { FINANCE } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateFinancialReportPayload,
  FinanceListParams,
  FinancialReport,
  UpdateFinancialReportPayload,
} from "./types";

export const financialReportService = {
  async list(params?: FinanceListParams): Promise<ApiEnvelope<FinancialReport[]>> {
    return api.get<ApiEnvelope<FinancialReport[]>>(
      FINANCE.FINANCIAL_REPORTS,
      params,
    );
  },

  async get(id: number | string): Promise<ApiEnvelope<FinancialReport>> {
    return api.get<ApiEnvelope<FinancialReport>>(
      `${FINANCE.FINANCIAL_REPORTS}/${id}`,
    );
  },

  async create(
    payload: CreateFinancialReportPayload,
  ): Promise<ApiEnvelope<FinancialReport>> {
    return api.post<ApiEnvelope<FinancialReport>>(FINANCE.FINANCIAL_REPORTS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateFinancialReportPayload,
  ): Promise<ApiEnvelope<FinancialReport>> {
    return api.put<ApiEnvelope<FinancialReport>>(
      `${FINANCE.FINANCIAL_REPORTS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${FINANCE.FINANCIAL_REPORTS}/${id}`);
  },
};
