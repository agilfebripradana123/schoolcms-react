import { api } from "@/lib/api";
import { FINANCE } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateFinancialReportPayload,
  FinanceListParams,
  FinancialReport,
  UpdateFinancialReportPayload,
} from "./types";

export interface FinancialReportListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface FinancialReportListResponse {
  success: boolean;
  message: string;
  data: FinancialReport[];
  meta: FinancialReportListMeta;
}

export const financialReportService = {
  async list(params?: FinanceListParams): Promise<FinancialReportListResponse> {
    return api.get<FinancialReportListResponse>(
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