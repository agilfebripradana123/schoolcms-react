import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AcademicListParams,
  CreateSemesterPayload,
  Semester,
  UpdateSemesterPayload,
} from "./types";

export const semesterService = {
  async list(params?: AcademicListParams): Promise<ApiEnvelope<Semester[]>> {
    return api.get<ApiEnvelope<Semester[]>>(ACADEMIC.SEMESTERS, params);
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
