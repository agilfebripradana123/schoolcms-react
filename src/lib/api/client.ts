import type { AxiosRequestConfig } from "axios";
import apiClient from "./axios";

type QueryParams = Record<string, string | number | boolean | null | undefined>;

async function get<T>(url: string, params?: QueryParams, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<T>(url, { params, ...config });
  return response.data;
}

async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

async function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
}

async function remove<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}

export const api = {
  get,
  post,
  put,
  patch,
  delete: remove,
};
