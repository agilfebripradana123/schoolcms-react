import type { ComponentType } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  token_type: string;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  current_page: number;
  data: T[];
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

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface ApiError {
  message: string;
  errors: Record<string, string[]>;
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
