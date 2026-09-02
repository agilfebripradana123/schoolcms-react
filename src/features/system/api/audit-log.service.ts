import { api } from "@/lib/api";
import { SYSTEM } from "@/lib/api";
import type { ApiEnvelope } from "@/types";
import type {
  AuditLog,
  AuditLogListParams,
  SystemPaginatedResponse,
} from "./types";

export const auditLogService = {
  async list(
    params?: AuditLogListParams,
  ): Promise<SystemPaginatedResponse<AuditLog>> {
    return api.get<SystemPaginatedResponse<AuditLog>>(SYSTEM.AUDIT_LOGS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<AuditLog>> {
    return api.get<ApiEnvelope<AuditLog>>(`${SYSTEM.AUDIT_LOGS}/${id}`);
  },
};
