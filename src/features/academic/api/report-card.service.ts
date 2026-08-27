import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AcademicListParams,
  CreateReportCardPayload,
  ReportCard,
  UpdateReportCardPayload,
} from "./types";

export const reportCardService = {
  async list(params?: AcademicListParams): Promise<ApiEnvelope<ReportCard[]>> {
    return api.get<ApiEnvelope<ReportCard[]>>(ACADEMIC.REPORT_CARDS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<ReportCard>> {
    return api.get<ApiEnvelope<ReportCard>>(`${ACADEMIC.REPORT_CARDS}/${id}`);
  },

  async create(payload: CreateReportCardPayload): Promise<ApiEnvelope<ReportCard>> {
    return api.post<ApiEnvelope<ReportCard>>(ACADEMIC.REPORT_CARDS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateReportCardPayload,
  ): Promise<ApiEnvelope<ReportCard>> {
    return api.put<ApiEnvelope<ReportCard>>(
      `${ACADEMIC.REPORT_CARDS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${ACADEMIC.REPORT_CARDS}/${id}`);
  },
};
