import { api } from "@/lib/api";
import { SYSTEM } from "@/lib/api";
import type { ApiEnvelope } from "@/types";
import type {
  BackupLog,
  BackupLogListParams,
  SystemPaginatedResponse,
} from "./types";

export const backupLogService = {
  async list(
    params?: BackupLogListParams,
  ): Promise<SystemPaginatedResponse<BackupLog>> {
    return api.get<SystemPaginatedResponse<BackupLog>>(SYSTEM.BACKUP_LOGS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<BackupLog>> {
    return api.get<ApiEnvelope<BackupLog>>(`${SYSTEM.BACKUP_LOGS}/${id}`);
  },
};
