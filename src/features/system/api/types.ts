import type { ListParams } from "@/types";

export interface Role {
  id: number;
  name: string;
  description?: string | null;
  permissions?: Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions?: number[];
}

export interface UpdateRolePayload extends Partial<CreateRolePayload> {}

export interface Permission {
  id: number;
  name: string;
  label?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePermissionPayload {
  name: string;
  label?: string;
  description?: string;
}

export interface UpdatePermissionPayload extends Partial<CreatePermissionPayload> {}

export interface UserManagement {
  id: number;
  name: string;
  username?: string;
  email: string;
  photo?: string | null;
  role?: string | null;
  role_id?: number | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserPayload {
  name: string;
  username?: string;
  email: string;
  password?: string;
  role_id?: number;
  is_active?: boolean;
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {}

export interface AuditLog {
  id: number;
  user_id?: number | null;
  event?: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Setting {
  id: number;
  key: string;
  value?: string | null;
  group?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSettingPayload {
  key: string;
  value?: string;
  group?: string;
}

export interface UpdateSettingPayload extends Partial<CreateSettingPayload> {}

export interface SystemListParams extends ListParams {
  role_id?: number;
  is_active?: boolean;
  status?: string;
}
