import { api } from "@/lib/api";
import { DEVELOPMENT } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  Counseling,
  CounselingListParams,
  CreateCounselingPayload,
  UpdateCounselingPayload,
} from "./types";

export interface CounselingListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface CounselingListResponse {
  success: boolean;
  message: string;
  data: Counseling[];
  meta: CounselingListMeta;
}

export const counselingService = {
  async list(params?: CounselingListParams): Promise<CounselingListResponse> {
    return api.get<CounselingListResponse>(DEVELOPMENT.COUNSELINGS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Counseling>> {
    return api.get<ApiEnvelope<Counseling>>(`${DEVELOPMENT.COUNSELINGS}/${id}`);
  },

  async create(payload: CreateCounselingPayload): Promise<ApiEnvelope<Counseling>> {
    return api.post<ApiEnvelope<Counseling>>(DEVELOPMENT.COUNSELINGS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateCounselingPayload,
  ): Promise<ApiEnvelope<Counseling>> {
    return api.put<ApiEnvelope<Counseling>>(
      `${DEVELOPMENT.COUNSELINGS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${DEVELOPMENT.COUNSELINGS}/${id}`);
  },
};