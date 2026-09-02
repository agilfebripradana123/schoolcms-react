import { api } from "@/lib/api";
import { SYSTEM } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateRolePayload,
  Role,
  RoleListParams,
  SyncRolePermissionsPayload,
  SystemPaginatedResponse,
  UpdateRolePayload,
} from "./types";

export const roleService = {
  async list(params?: RoleListParams): Promise<SystemPaginatedResponse<Role>> {
    return api.get<SystemPaginatedResponse<Role>>(SYSTEM.ROLES, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Role>> {
    return api.get<ApiEnvelope<Role>>(`${SYSTEM.ROLES}/${id}`);
  },

  async create(payload: CreateRolePayload): Promise<ApiEnvelope<Role>> {
    return api.post<ApiEnvelope<Role>>(SYSTEM.ROLES, payload);
  },

  async update(
    id: number | string,
    payload: UpdateRolePayload,
  ): Promise<ApiEnvelope<Role>> {
    return api.put<ApiEnvelope<Role>>(`${SYSTEM.ROLES}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${SYSTEM.ROLES}/${id}`);
  },

  async syncPermissions(
    id: number | string,
    payload: SyncRolePermissionsPayload,
  ): Promise<ApiEnvelope<Role>> {
    return api.post<ApiEnvelope<Role>>(
      SYSTEM.ROLES_PERMISSIONS.replace("{id}", String(id)),
      payload,
    );
  },
};
