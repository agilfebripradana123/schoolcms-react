export interface UserNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationsListResponse {
  success?: boolean;
  message: string;
  data: UserNotification[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface UnreadCountResponse {
  success?: boolean;
  message: string;
  data: {
    unread_count: number;
  };
}

export interface MarkReadResponse {
  success?: boolean;
  message: string;
  data: UserNotification;
}

export interface MarkAllReadResponse {
  success?: boolean;
  message: string;
  data: {
    updated: number;
  };
}
