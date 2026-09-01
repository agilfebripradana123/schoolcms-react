import { api } from "@/lib/api";
import { STAFF } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateStaffPayload,
  Staff,
  TeacherListParams,
  UpdateStaffPayload,
} from "./types";

export const staffService = {
  async list(params?: TeacherListParams): Promise<ApiEnvelope<Staff[]>> {
    return api.get<ApiEnvelope<Staff[]>>(STAFF.STAFF, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Staff>> {
    return api.get<ApiEnvelope<Staff>>(`${STAFF.STAFF}/${id}`);
  },

  async create(payload: CreateStaffPayload): Promise<ApiEnvelope<Staff>> {
    return api.post<ApiEnvelope<Staff>>(STAFF.STAFF, payload);
  },

  async update(
    id: number | string,
    payload: UpdateStaffPayload,
  ): Promise<ApiEnvelope<Staff>> {
    return api.put<ApiEnvelope<Staff>>(`${STAFF.STAFF}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${STAFF.STAFF}/${id}`);
  },
};
