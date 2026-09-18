import { api } from "@/lib/api";
import { EXAMINATION } from "@/lib/api";
import type { ListParams } from "@/types";
import type { ExamAttemptOption, ExaminationListMeta } from "./types";

export interface ExamAttemptListParams extends ListParams {
  exam_id?: number;
  participant_id?: number;
  status?: "submitted" | "expired";
  search?: string;
}

export interface ExamAttemptListResponse {
  success: boolean;
  message: string;
  data: ExamAttemptOption[];
  meta: ExaminationListMeta;
}

/** Admin-scoped eligible attempt listing (result-creation selector). */
export const examAttemptService = {
  async listEligible(
    params?: ExamAttemptListParams,
  ): Promise<ExamAttemptListResponse> {
    return api.get<ExamAttemptListResponse>(EXAMINATION.EXAM_ATTEMPTS, params);
  },
};