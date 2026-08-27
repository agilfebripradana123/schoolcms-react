import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateStudentIdCardPayload,
  StudentIdCard,
  StudentListParams,
  UpdateStudentIdCardPayload,
} from "./types";

export const studentIdCardService = {
  async list(params?: StudentListParams): Promise<ApiEnvelope<StudentIdCard[]>> {
    return api.get<ApiEnvelope<StudentIdCard[]>>(STUDENTS.STUDENT_ID_CARDS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<StudentIdCard>> {
    return api.get<ApiEnvelope<StudentIdCard>>(`${STUDENTS.STUDENT_ID_CARDS}/${id}`);
  },

  async create(
    payload: CreateStudentIdCardPayload,
  ): Promise<ApiEnvelope<StudentIdCard>> {
    return api.post<ApiEnvelope<StudentIdCard>>(STUDENTS.STUDENT_ID_CARDS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateStudentIdCardPayload,
  ): Promise<ApiEnvelope<StudentIdCard>> {
    return api.put<ApiEnvelope<StudentIdCard>>(
      `${STUDENTS.STUDENT_ID_CARDS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${STUDENTS.STUDENT_ID_CARDS}/${id}`);
  },
};
