import { api } from "@/lib/api";
import { FACILITIES } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateMaintenancePayload,
  FacilitiesListParams,
  Maintenance,
  UpdateMaintenancePayload,
} from "./types";

export const maintenanceService = {
  async list(params?: FacilitiesListParams): Promise<ApiEnvelope<Maintenance[]>> {
    return api.get<ApiEnvelope<Maintenance[]>>(FACILITIES.MAINTENANCE, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Maintenance>> {
    return api.get<ApiEnvelope<Maintenance>>(`${FACILITIES.MAINTENANCE}/${id}`);
  },

  async create(payload: CreateMaintenancePayload): Promise<ApiEnvelope<Maintenance>> {
    return api.post<ApiEnvelope<Maintenance>>(FACILITIES.MAINTENANCE, payload);
  },

  async update(
    id: number | string,
    payload: UpdateMaintenancePayload,
  ): Promise<ApiEnvelope<Maintenance>> {
    return api.put<ApiEnvelope<Maintenance>>(
      `${FACILITIES.MAINTENANCE}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${FACILITIES.MAINTENANCE}/${id}`);
  },
};
