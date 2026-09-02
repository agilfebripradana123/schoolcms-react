import type { ListParams } from "@/types";

/* ── Announcements ── */

export type AnnouncementCategory = "umum" | "guru" | "siswa";

export interface Announcement {
  id: number;
  title: string;
  content: string;
  category: AnnouncementCategory;
  attachment?: string | null;
  publish_date?: string | null;
  expired_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  category: AnnouncementCategory;
  attachment?: string | null;
  publish_date?: string | null;
  expired_date?: string | null;
}

export interface UpdateAnnouncementPayload
  extends Partial<CreateAnnouncementPayload> {}

/* ── Notifications ── */

export interface NotificationUser {
  id: number;
  role_id?: number;
  name: string;
  username?: string;
  email?: string;
  photo?: string | null;
}

export interface UserNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type?: string | null;
  is_read: boolean;
  read_at?: string | null;
  user?: NotificationUser | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateNotificationPayload {
  user_id: number;
  title: string;
  message: string;
  type?: string | null;
  is_read?: boolean;
  read_at?: string | null;
}

export interface UpdateNotificationPayload
  extends Partial<CreateNotificationPayload> {}

/* ── Calendar ── */

export type CalendarType = "umum" | "ujian" | "libur" | "kegiatan" | "rapat";

export interface CalendarAcademicYear {
  id: number;
  name: string;
  is_active?: boolean;
}

export interface Calendar {
  id: number;
  title: string;
  description?: string | null;
  event_date: string;
  type: CalendarType;
  academic_year_id?: number | null;
  academic_year?: CalendarAcademicYear | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCalendarPayload {
  title: string;
  description?: string | null;
  event_date: string;
  type: CalendarType;
  academic_year_id?: number | null;
}

export interface UpdateCalendarPayload extends Partial<CreateCalendarPayload> {}

/* ── List (Communication) ── */

export interface CommunicationListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface CommunicationListResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: CommunicationListMeta;
}

export interface CommunicationListParams extends ListParams {
  is_read?: boolean;
  type?: string;
}