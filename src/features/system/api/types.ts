import type { ApiEnvelope, ListParams } from "@/types";

export interface SystemPaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface SystemPaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: SystemPaginationMeta;
}

// ---- Permission (read-only catalog) ----
export interface Permission {
  id: number;
  name: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

// ---- Role ----
export interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions?: Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string | null;
  permission_ids?: number[];
}

export interface UpdateRolePayload extends Partial<CreateRolePayload> {}

export interface SyncRolePermissionsPayload {
  permission_ids: number[];
}

// ---- User ----
export interface UserRole {
  id: number;
  name: string;
}

export interface UserManagement {
  id: number;
  role_id: number;
  name: string;
  username: string | null;
  email: string;
  photo: string | null;
  is_active: boolean;
  role: UserRole | null;
}

export interface CreateUserPayload {
  role_id: number;
  name: string;
  username?: string | null;
  email: string;
  password: string;
  photo?: string | null;
  is_active?: boolean;
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {}

// ---- Audit Log ----
export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  model: string | null;
  model_id: number | null;
  description: string;
  ip_address: string;
  user_agent: string | null;
  user: UserManagement | null;
  created_at?: string;
}

// ---- Setting ----
export interface Setting {
  id: number;
  key: string;
  value: string | null;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSettingPayload {
  key: string;
  value?: string | null;
  description?: string | null;
}

export interface UpdateSettingPayload extends Partial<CreateSettingPayload> {}

export interface RoleListParams extends ListParams {
  search?: string;
}

export interface PermissionListParams extends ListParams {
  search?: string;
}

export interface UserListParams extends ListParams {
  q?: string;
  role_id?: number;
  is_active?: boolean;
}

export interface AuditLogListParams extends ListParams {
  q?: string;
  user_id?: number;
  action?: string;
  model?: string;
}

export interface SettingListParams extends ListParams {
  q?: string;
}

// Re-export helper for single-resource responses
export type { ApiEnvelope };
