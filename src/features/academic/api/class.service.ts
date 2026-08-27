import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AcademicListParams,
  CreateSchoolClassPayload,
  SchoolClass,
  UpdateSchoolClassPayload,
} from "./types";

export const classService = {
  async list(params?: AcademicListParams): Promise<ApiEnvelope<SchoolClass[]>> {
    return api.get<ApiEnvelope<SchoolClass[]>>(ACADEMIC.CLASSES, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<SchoolClass>> {
    return api.get<ApiEnvelope<SchoolClass>>(`${ACADEMIC.CLASSES}/${id}`);
  },

  async create(payload: CreateSchoolClassPayload): Promise<ApiEnvelope<SchoolClass>> {
    return api.post<ApiEnvelope<SchoolClass>>(ACADEMIC.CLASSES, payload);
  },

  async update(
    id: number | string,
    payload: UpdateSchoolClassPayload,
  ): Promise<ApiEnvelope<SchoolClass>> {
    return api.put<ApiEnvelope<SchoolClass>>(
      `${ACADEMIC.CLASSES}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${ACADEMIC.CLASSES}/${id}`);
  },
};
