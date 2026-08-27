import type { ListParams } from "@/types";

export interface Announcement {
  id: number;
  title?: string;
  content?: string | null;
  starts_at?: string;
  ends_at?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAnnouncementPayload {
  title?: string;
  content?: string;
  starts_at?: string;
  ends_at?: string;
  is_active?: boolean;
}

export interface UpdateAnnouncementPayload extends Partial<CreateAnnouncementPayload> {}

export interface UserNotification {
  id: number;
  user_id?: number;
  title?: string;
  message?: string | null;
  is_read?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateNotificationPayload {
  user_id?: number;
  title?: string;
  message?: string;
  is_read?: boolean;
}

export interface UpdateNotificationPayload extends Partial<CreateNotificationPayload> {}

export interface Calendar {
  id: number;
  title: string;
  description?: string | null;
  starts_at?: string;
  ends_at?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCalendarPayload {
  title: string;
  description?: string;
  starts_at?: string;
  ends_at?: string;
  color?: string;
}

export interface UpdateCalendarPayload extends Partial<CreateCalendarPayload> {}

export interface CommunicationListParams extends ListParams {
  is_read?: boolean;
  status?: string;
}
