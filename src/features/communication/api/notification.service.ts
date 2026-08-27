import { api } from "@/lib/api";
import { COMMUNICATION } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CommunicationListParams,
  CreateNotificationPayload,
  UpdateNotificationPayload,
  UserNotification,
} from "./types";

export const notificationService = {
  async list(
    params?: CommunicationListParams,
  ): Promise<ApiEnvelope<UserNotification[]>> {
    return api.get<ApiEnvelope<UserNotification[]>>(COMMUNICATION.NOTIFICATIONS, params);
  },

  async myNotifications(
    params?: CommunicationListParams,
  ): Promise<ApiEnvelope<UserNotification[]>> {
    return api.get<ApiEnvelope<UserNotification[]>>(
      COMMUNICATION.NOTIFICATIONS_MY,
      params,
    );
  },

  async get(id: number | string): Promise<ApiEnvelope<UserNotification>> {
    return api.get<ApiEnvelope<UserNotification>>(`${COMMUNICATION.NOTIFICATIONS}/${id}`);
  },

  async create(
    payload: CreateNotificationPayload,
  ): Promise<ApiEnvelope<UserNotification>> {
    return api.post<ApiEnvelope<UserNotification>>(COMMUNICATION.NOTIFICATIONS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateNotificationPayload,
  ): Promise<ApiEnvelope<UserNotification>> {
    return api.put<ApiEnvelope<UserNotification>>(
      `${COMMUNICATION.NOTIFICATIONS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${COMMUNICATION.NOTIFICATIONS}/${id}`);
  },
};
