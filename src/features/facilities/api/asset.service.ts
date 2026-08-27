import { api } from "@/lib/api";
import { FACILITIES } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  Asset,
  CreateAssetPayload,
  FacilitiesListParams,
  UpdateAssetPayload,
} from "./types";

export const assetService = {
  async list(params?: FacilitiesListParams): Promise<ApiEnvelope<Asset[]>> {
    return api.get<ApiEnvelope<Asset[]>>(FACILITIES.ASSETS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Asset>> {
    return api.get<ApiEnvelope<Asset>>(`${FACILITIES.ASSETS}/${id}`);
  },

  async create(payload: CreateAssetPayload): Promise<ApiEnvelope<Asset>> {
    return api.post<ApiEnvelope<Asset>>(FACILITIES.ASSETS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateAssetPayload,
  ): Promise<ApiEnvelope<Asset>> {
    return api.put<ApiEnvelope<Asset>>(`${FACILITIES.ASSETS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${FACILITIES.ASSETS}/${id}`);
  },
};
