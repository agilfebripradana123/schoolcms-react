import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateSemesterPayload,
  Semester,
  UpdateSemesterPayload,
} from "./types";

export interface SemesterListParams {
  academic_year_id?: number;
  is_active?: boolean;
  page?: number;
  per_page?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface SemesterListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface SemesterListResponse {
  success: boolean;
  message: string;
  data: Semester[];
  meta: SemesterListMeta;
}

export const semesterService = {
  async list(
    params?: SemesterListParams,
  ): Promise<SemesterListResponse> {
    return api.get<SemesterListResponse>(ACADEMIC.SEMESTERS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Semester>> {
    return api.get<ApiEnvelope<Semester>>(`${ACADEMIC.SEMESTERS}/${id}`);
  },

  async create(payload: CreateSemesterPayload): Promise<ApiEnvelope<Semester>> {
    return api.post<ApiEnvelope<Semester>>(ACADEMIC.SEMESTERS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateSemesterPayload,
  ): Promise<ApiEnvelope<Semester>> {
    return api.put<ApiEnvelope<Semester>>(
      `${ACADEMIC.SEMESTERS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${ACADEMIC.SEMESTERS}/${id}`);
  },
};
