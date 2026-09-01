import { api } from "@/lib/api";
import { COMMUNICATION } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  Announcement,
  CommunicationListParams,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
} from "./types";

export const announcementService = {
  async list(
    params?: CommunicationListParams,
  ): Promise<ApiEnvelope<Announcement[]>> {
    return api.get<ApiEnvelope<Announcement[]>>(COMMUNICATION.ANNOUNCEMENTS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Announcement>> {
    return api.get<ApiEnvelope<Announcement>>(`${COMMUNICATION.ANNOUNCEMENTS}/${id}`);
  },

  async create(
    payload: CreateAnnouncementPayload,
  ): Promise<ApiEnvelope<Announcement>> {
    return api.post<ApiEnvelope<Announcement>>(COMMUNICATION.ANNOUNCEMENTS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateAnnouncementPayload,
  ): Promise<ApiEnvelope<Announcement>> {
    return api.put<ApiEnvelope<Announcement>>(
      `${COMMUNICATION.ANNOUNCEMENTS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${COMMUNICATION.ANNOUNCEMENTS}/${id}`);
  },
};
