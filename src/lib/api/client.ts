import type { AxiosRequestConfig } from "axios";
import apiClient from "./axios";

type QueryParams = Record<string, string | number | boolean | null | undefined>;

/** Dedup request GET inflight per URL+params — hindari N+1 query duplikat paralel. */
const inflightGet = new Map<string, Promise<unknown>>();
function gkey(url: string, params?: QueryParams): string {
  return `GET|${url}|${params ? JSON.stringify(params) : ""}`;
}

export const api = {
  get<T>(url: string, params?: QueryParams, config?: AxiosRequestConfig): Promise<T> {
    const k = gkey(url, params);
    const existing = inflightGet.get(k);
    if (existing) return existing as Promise<T>;
    const p = apiClient.get<T>(url, { params, ...config })
      .then((res) => res.data)
      .finally(() => inflightGet.delete(k));
    inflightGet.set(k, p);
    return p;
  },
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.post<T>(url, data, config).then((res) => res.data);
  },
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.put<T>(url, data, config).then((res) => res.data);
  },
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.patch<T>(url, data, config).then((res) => res.data);
  },
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.delete<T>(url, config).then((res) => res.data);
  },
};