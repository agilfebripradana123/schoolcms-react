import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AcademicListParams,
  CreateCurriculumPayload,
  Curriculum,
  UpdateCurriculumPayload,
} from "./types";

export const curriculumService = {
  async list(params?: AcademicListParams): Promise<ApiEnvelope<Curriculum[]>> {
    return api.get<ApiEnvelope<Curriculum[]>>(ACADEMIC.CURRICULUMS, params);
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
