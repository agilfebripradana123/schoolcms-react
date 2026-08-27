import { api } from "@/lib/api";
import { SYSTEM } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateUserPayload,
  SystemListParams,
  UpdateUserPayload,
  UserManagement,
} from "./types";

export const userManagementService = {
  async list(params?: SystemListParams): Promise<ApiEnvelope<UserManagement[]>> {
    return api.get<ApiEnvelope<UserManagement[]>>(SYSTEM.USERS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<UserManagement>> {
    return api.get<ApiEnvelope<UserManagement>>(`${SYSTEM.USERS}/${id}`);
  },

  async create(payload: CreateUserPayload): Promise<ApiEnvelope<UserManagement>> {
    return api.post<ApiEnvelope<UserManagement>>(SYSTEM.USERS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateUserPayload,
  ): Promise<ApiEnvelope<UserManagement>> {
    return api.put<ApiEnvelope<UserManagement>>(`${SYSTEM.USERS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${SYSTEM.USERS}/${id}`);
  },
};
