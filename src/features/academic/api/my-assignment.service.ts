import { api } from "@/lib/api";
import { TEACHER } from "@/lib/api/endpoints";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AcademicListParams,
  Assignment,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from "./types";

export interface MyAssignmentListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface MyAssignmentListResponse {
  success: boolean;
  message: string;
  data: Assignment[];
  meta: MyAssignmentListMeta;
}

/**
 * Teacher self-service: Tugas (Portal Guru).
 * Semua scope ditentukan backend dari user login (teacher profile + TeacherAssignment),
 * bukan parameter teacher_id dari client.
 */
export const myAssignmentService = {
  async list(params?: AcademicListParams): Promise<MyAssignmentListResponse> {
    return api.get<MyAssignmentListResponse>(TEACHER.ASSIGNMENTS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Assignment>> {
    return api.get<ApiEnvelope<Assignment>>(`${TEACHER.ASSIGNMENTS}/${id}`);
  },

  async create(payload: CreateAssignmentPayload): Promise<ApiEnvelope<Assignment>> {
    return api.post<ApiEnvelope<Assignment>>(TEACHER.ASSIGNMENTS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateAssignmentPayload,
  ): Promise<ApiEnvelope<Assignment>> {
    return api.put<ApiEnvelope<Assignment>>(`${TEACHER.ASSIGNMENTS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${TEACHER.ASSIGNMENTS}/${id}`);
  },
};
