import { api } from "@/lib/api";
import { SYSTEM } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateSettingPayload,
  Setting,
  SystemListParams,
  UpdateSettingPayload,
} from "./types";

export const settingService = {
  async list(params?: SystemListParams): Promise<ApiEnvelope<Setting[]>> {
    return api.get<ApiEnvelope<Setting[]>>(SYSTEM.SETTINGS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Setting>> {
    return api.get<ApiEnvelope<Setting>>(`${SYSTEM.SETTINGS}/${id}`);
  },

  async create(payload: CreateSettingPayload): Promise<ApiEnvelope<Setting>> {
    return api.post<ApiEnvelope<Setting>>(SYSTEM.SETTINGS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateSettingPayload,
  ): Promise<ApiEnvelope<Setting>> {
    return api.put<ApiEnvelope<Setting>>(`${SYSTEM.SETTINGS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${SYSTEM.SETTINGS}/${id}`);
  },
};
