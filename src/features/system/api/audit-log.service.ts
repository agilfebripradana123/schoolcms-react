import { api } from "@/lib/api";
import { SYSTEM } from "@/lib/api";
import type { ApiEnvelope } from "@/types";
import type { AuditLog, SystemListParams } from "./types";

export const auditLogService = {
  async list(params?: SystemListParams): Promise<ApiEnvelope<AuditLog[]>> {
    return api.get<ApiEnvelope<AuditLog[]>>(SYSTEM.AUDIT_LOGS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<AuditLog>> {
    return api.get<ApiEnvelope<AuditLog>>(`${SYSTEM.AUDIT_LOGS}/${id}`);
  },
};
