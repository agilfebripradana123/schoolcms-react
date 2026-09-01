import { api } from "@/lib/api";
import { FACILITIES } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateRoomPayload,
  FacilitiesListParams,
  FacilitiesPaginatedResponse,
  Room,
  UpdateRoomPayload,
} from "./types";

export const roomService = {
  async list(
    params?: FacilitiesListParams,
  ): Promise<FacilitiesPaginatedResponse<Room[]>> {
    return api.get<FacilitiesPaginatedResponse<Room[]>>(FACILITIES.ROOMS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Room>> {
    return api.get<ApiEnvelope<Room>>(`${FACILITIES.ROOMS}/${id}`);
  },

  async create(payload: CreateRoomPayload): Promise<ApiEnvelope<Room>> {
    return api.post<ApiEnvelope<Room>>(FACILITIES.ROOMS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateRoomPayload,
  ): Promise<ApiEnvelope<Room>> {
    return api.put<ApiEnvelope<Room>>(`${FACILITIES.ROOMS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${FACILITIES.ROOMS}/${id}`);
  },
};
