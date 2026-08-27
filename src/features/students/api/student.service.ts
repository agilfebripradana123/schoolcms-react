import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateStudentPayload,
  Student,
  StudentListParams,
  UpdateStudentPayload,
} from "./types";

export interface StudentListResponse {
  success?: boolean;
  message: string;
  data: Student[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export const studentService = {
  async list(params?: StudentListParams): Promise<StudentListResponse> {
    return api.get<StudentListResponse>(STUDENTS.STUDENTS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Student>> {
    return api.get<ApiEnvelope<Student>>(`${STUDENTS.STUDENTS}/${id}`);
  },

  async create(payload: CreateStudentPayload): Promise<ApiEnvelope<Student>> {
    return api.post<ApiEnvelope<Student>>(STUDENTS.STUDENTS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateStudentPayload,
  ): Promise<ApiEnvelope<Student>> {
    return api.put<ApiEnvelope<Student>>(`${STUDENTS.STUDENTS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${STUDENTS.STUDENTS}/${id}`);
  },
};
