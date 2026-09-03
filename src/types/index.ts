import type { ComponentType } from "react";

export interface User {
  id: number;
  name: string;
  username?: string;
  email: string;
  photo?: string | null;
  is_active?: boolean;
  role: string;
  permissions?: string[];
}

export interface LoginPayload {
  login: string;
  password: string;
  expected_role?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PaginatedData<T> extends PaginationMeta {
  data: T[];
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface ApiEnvelope<T> {
  success?: boolean;
  message: string;
  data: T;
}

export interface ApiMessage {
  success?: boolean;
  message: string;
}

export interface ListParams {
  search?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: "asc" | "desc";
  [key: string]: string | number | boolean | null | undefined;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
  originalError?: unknown;
}

export interface IconComponent {
  className?: string;
}

export interface NavigationItem {
  label: string;
  path: string;
  icon: ComponentType<IconComponent>;
  children?: NavigationItem[];
  permission?: string;
  roles?: string[];
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}
