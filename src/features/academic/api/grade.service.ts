import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AcademicListParams,
  CreateGradePayload,
  Grade,
  UpdateGradePayload,
} from "./types";

export const gradeService = {
  async list(params?: AcademicListParams): Promise<ApiEnvelope<Grade[]>> {
    return api.get<ApiEnvelope<Grade[]>>(ACADEMIC.GRADES, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Grade>> {
    return api.get<ApiEnvelope<Grade>>(`${ACADEMIC.GRADES}/${id}`);
  },

  async create(payload: CreateGradePayload): Promise<ApiEnvelope<Grade>> {
    return api.post<ApiEnvelope<Grade>>(ACADEMIC.GRADES, payload);
  },

  async update(
    id: number | string,
    payload: UpdateGradePayload,
  ): Promise<ApiEnvelope<Grade>> {
    return api.put<ApiEnvelope<Grade>>(`${ACADEMIC.GRADES}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${ACADEMIC.GRADES}/${id}`);
  },
};
