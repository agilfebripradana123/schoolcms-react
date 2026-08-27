import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateStudentParentPayload,
  StudentListParams,
  StudentParent,
  UpdateStudentParentPayload,
} from "./types";

export const parentService = {
  async list(params?: StudentListParams): Promise<ApiEnvelope<StudentParent[]>> {
    return api.get<ApiEnvelope<StudentParent[]>>(STUDENTS.PARENTS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<StudentParent>> {
    return api.get<ApiEnvelope<StudentParent>>(`${STUDENTS.PARENTS}/${id}`);
  },

  async create(payload: CreateStudentParentPayload): Promise<ApiEnvelope<StudentParent>> {
    return api.post<ApiEnvelope<StudentParent>>(STUDENTS.PARENTS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateStudentParentPayload,
  ): Promise<ApiEnvelope<StudentParent>> {
    return api.put<ApiEnvelope<StudentParent>>(`${STUDENTS.PARENTS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${STUDENTS.PARENTS}/${id}`);
  },
};
