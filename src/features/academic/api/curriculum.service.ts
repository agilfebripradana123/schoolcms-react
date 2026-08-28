import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateCurriculumPayload,
  Curriculum,
  UpdateCurriculumPayload,
} from "./types";

export interface CurriculumListParams {
  q?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface CurriculumListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface CurriculumListResponse {
  success: boolean;
  message: string;
  data: Curriculum[];
  meta: CurriculumListMeta;
}

export const curriculumService = {
  async list(
    params?: CurriculumListParams,
  ): Promise<CurriculumListResponse> {
    return api.get<CurriculumListResponse>(ACADEMIC.CURRICULUMS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Curriculum>> {
    return api.get<ApiEnvelope<Curriculum>>(`${ACADEMIC.CURRICULUMS}/${id}`);
  },

  async create(payload: CreateCurriculumPayload): Promise<ApiEnvelope<Curriculum>> {
    return api.post<ApiEnvelope<Curriculum>>(ACADEMIC.CURRICULUMS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateCurriculumPayload,
  ): Promise<ApiEnvelope<Curriculum>> {
    return api.put<ApiEnvelope<Curriculum>>(
      `${ACADEMIC.CURRICULUMS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${ACADEMIC.CURRICULUMS}/${id}`);
  },
};
