import { api } from "@/lib/api";
import { SYSTEM } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreatePermissionPayload,
  Permission,
  SystemListParams,
  UpdatePermissionPayload,
} from "./types";

export const permissionService = {
  async list(params?: SystemListParams): Promise<ApiEnvelope<Permission[]>> {
    return api.get<ApiEnvelope<Permission[]>>(SYSTEM.PERMISSIONS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Permission>> {
    return api.get<ApiEnvelope<Permission>>(`${SYSTEM.PERMISSIONS}/${id}`);
  },

  async create(payload: CreatePermissionPayload): Promise<ApiEnvelope<Permission>> {
    return api.post<ApiEnvelope<Permission>>(SYSTEM.PERMISSIONS, payload);
  },

  async update(
    id: number | string,
    payload: UpdatePermissionPayload,
  ): Promise<ApiEnvelope<Permission>> {
    return api.put<ApiEnvelope<Permission>>(`${SYSTEM.PERMISSIONS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${SYSTEM.PERMISSIONS}/${id}`);
  },
};
