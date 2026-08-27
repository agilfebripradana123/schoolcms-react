import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AcademicYear,
  AcademicListParams,
  CreateAcademicYearPayload,
  UpdateAcademicYearPayload,
} from "./types";

export const academicYearService = {
  async list(params?: AcademicListParams): Promise<ApiEnvelope<AcademicYear[]>> {
    return api.get<ApiEnvelope<AcademicYear[]>>(ACADEMIC.ACADEMIC_YEARS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<AcademicYear>> {
    return api.get<ApiEnvelope<AcademicYear>>(`${ACADEMIC.ACADEMIC_YEARS}/${id}`);
  },

  async create(payload: CreateAcademicYearPayload): Promise<ApiEnvelope<AcademicYear>> {
    return api.post<ApiEnvelope<AcademicYear>>(ACADEMIC.ACADEMIC_YEARS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateAcademicYearPayload,
  ): Promise<ApiEnvelope<AcademicYear>> {
    return api.put<ApiEnvelope<AcademicYear>>(
      `${ACADEMIC.ACADEMIC_YEARS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${ACADEMIC.ACADEMIC_YEARS}/${id}`);
  },
};
