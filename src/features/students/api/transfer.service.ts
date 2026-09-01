import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateTransferPayload,
  StudentListParams,
  Transfer,
  UpdateTransferPayload,
} from "./types";

export const transferService = {
  async list(params?: StudentListParams): Promise<ApiEnvelope<Transfer[]>> {
    return api.get<ApiEnvelope<Transfer[]>>(STUDENTS.TRANSFERS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Transfer>> {
    return api.get<ApiEnvelope<Transfer>>(`${STUDENTS.TRANSFERS}/${id}`);
  },

  async create(payload: CreateTransferPayload): Promise<ApiEnvelope<Transfer>> {
    return api.post<ApiEnvelope<Transfer>>(STUDENTS.TRANSFERS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateTransferPayload,
  ): Promise<ApiEnvelope<Transfer>> {
    return api.put<ApiEnvelope<Transfer>>(`${STUDENTS.TRANSFERS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${STUDENTS.TRANSFERS}/${id}`);
  },
};
