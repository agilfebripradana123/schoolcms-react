import { api } from "@/lib/api";
import { SYSTEM } from "@/lib/api";
import type {
  Permission,
  PermissionListParams,
  SystemPaginatedResponse,
} from "./types";

export const permissionService = {
  async list(
    params?: PermissionListParams,
  ): Promise<SystemPaginatedResponse<Permission>> {
    return api.get<SystemPaginatedResponse<Permission>>(
      SYSTEM.PERMISSIONS,
      params,
    );
  },
};
