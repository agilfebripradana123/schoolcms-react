import { AxiosError } from "axios";
import type { ApiError } from "@/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isErrorPayload(value: unknown): value is ApiError {
  return isRecord(value) && typeof value.message === "string";
}

function extractValidationErrors(payload: unknown): Record<string, string[]> | undefined {
  if (!isRecord(payload) || !isRecord(payload.errors)) {
    return undefined;
  }
  return payload.errors as Record<string, string[]>;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const payload = error.response?.data;

    if (isErrorPayload(payload)) {
      const validationErrors = extractValidationErrors(payload);
      return {
        message: payload.message,
        status: error.response?.status,
        errors: validationErrors,
        originalError: error,
      };
    }

    const fallbackMessages: Record<number, string> = {
      400: "Permintaan tidak valid.",
      401: "Sesi Anda telah berakhir. Silakan masuk kembali.",
      403: "Anda tidak memiliki izin untuk melakukan tindakan ini.",
      404: "Data tidak ditemukan.",
      422: "Data yang Anda masukkan tidak valid.",
      429: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
      500: "Terjadi kesalahan pada server.",
    };

    return {
      message: fallbackMessages[error.response?.status ?? 0] ?? "Terjadi kesalahan.",
      status: error.response?.status,
      originalError: error,
    };
  }

  if (error instanceof Error) {
    return { message: error.message, originalError: error };
  }

  return { message: "Terjadi kesalahan yang tidak diketahui." };
}
