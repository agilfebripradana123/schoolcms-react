import { api } from "@/lib/api";
import { ADMINISTRATION } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AdministrationListParams,
  AdministrationListResponse,
  CreateDispositionPayload,
  Disposition,
  UpdateDispositionPayload,
} from "./types";

export const dispositionService = {
  async list(
    params?: AdministrationListParams,
  ): Promise<AdministrationListResponse<Disposition[]>> {
    return api.get<AdministrationListResponse<Disposition[]>>(
      ADMINISTRATION.DISPOSITIONS,
      params,
    );
  },

  async get(id: number | string): Promise<ApiEnvelope<Disposition>> {
    return api.get<ApiEnvelope<Disposition>>(`${ADMINISTRATION.DISPOSITIONS}/${id}`);
  },

  async create(payload: CreateDispositionPayload): Promise<ApiEnvelope<Disposition>> {
    return api.post<ApiEnvelope<Disposition>>(ADMINISTRATION.DISPOSITIONS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateDispositionPayload,
  ): Promise<ApiEnvelope<Disposition>> {
    return api.put<ApiEnvelope<Disposition>>(
      `${ADMINISTRATION.DISPOSITIONS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${ADMINISTRATION.DISPOSITIONS}/${id}`);
  },
};