import { api } from "@/lib/api";
import { NOTIFICATION } from "@/lib/api";
import type {
  MarkAllReadResponse,
  MarkReadResponse,
  NotificationsListResponse,
  UnreadCountResponse,
} from "./types";

type ListParams = {
  page?: number;
  per_page?: number;
  is_read?: boolean;
  type?: string;
};

export const notificationService = {
  async list(params?: ListParams): Promise<NotificationsListResponse> {
    return api.get<NotificationsListResponse>(NOTIFICATION.MY, params);
  },

  async unreadCount(): Promise<UnreadCountResponse> {
    return api.get<UnreadCountResponse>(NOTIFICATION.UNREAD_COUNT);
  },

  async markAsRead(id: number | string): Promise<MarkReadResponse> {
    return api.put<MarkReadResponse>(
      NOTIFICATION.READ.replace("{id}", String(id)),
    );
  },

  async markAllAsRead(): Promise<MarkAllReadResponse> {
    return api.put<MarkAllReadResponse>(NOTIFICATION.READ_ALL);
  },
};
