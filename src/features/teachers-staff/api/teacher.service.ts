import { api } from "@/lib/api";
import { STAFF } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateTeacherPayload,
  Teacher,
  TeacherListParams,
  UpdateTeacherPayload,
} from "./types";

export const teacherService = {
  async list(params?: TeacherListParams): Promise<ApiEnvelope<Teacher[]>> {
    return api.get<ApiEnvelope<Teacher[]>>(STAFF.TEACHERS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Teacher>> {
    return api.get<ApiEnvelope<Teacher>>(`${STAFF.TEACHERS}/${id}`);
  },

  async create(payload: CreateTeacherPayload): Promise<ApiEnvelope<Teacher>> {
    return api.post<ApiEnvelope<Teacher>>(STAFF.TEACHERS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateTeacherPayload,
  ): Promise<ApiEnvelope<Teacher>> {
    return api.put<ApiEnvelope<Teacher>>(`${STAFF.TEACHERS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${STAFF.TEACHERS}/${id}`);
  },

  async exportData(params?: TeacherListParams): Promise<ApiEnvelope<unknown>> {
    return api.get<ApiEnvelope<unknown>>(`${STAFF.TEACHERS}/export`, params);
  },

  async importData(payload: FormData): Promise<ApiMessage> {
    return api.post<ApiMessage>(`${STAFF.TEACHERS}/import`, payload);
  },
};
