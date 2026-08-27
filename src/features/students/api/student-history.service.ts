import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateStudentHistoryPayload,
  StudentHistory,
  StudentListParams,
  UpdateStudentHistoryPayload,
} from "./types";

export const studentHistoryService = {
  async list(params?: StudentListParams): Promise<ApiEnvelope<StudentHistory[]>> {
    return api.get<ApiEnvelope<StudentHistory[]>>(STUDENTS.STUDENT_HISTORIES, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<StudentHistory>> {
    return api.get<ApiEnvelope<StudentHistory>>(
      `${STUDENTS.STUDENT_HISTORIES}/${id}`,
    );
  },

  async create(
    payload: CreateStudentHistoryPayload,
  ): Promise<ApiEnvelope<StudentHistory>> {
    return api.post<ApiEnvelope<StudentHistory>>(
      STUDENTS.STUDENT_HISTORIES,
      payload,
    );
  },

  async update(
    id: number | string,
    payload: UpdateStudentHistoryPayload,
  ): Promise<ApiEnvelope<StudentHistory>> {
    return api.put<ApiEnvelope<StudentHistory>>(
      `${STUDENTS.STUDENT_HISTORIES}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${STUDENTS.STUDENT_HISTORIES}/${id}`);
  },
};
