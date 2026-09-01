import { api } from "@/lib/api";
import { PPDB } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateRegistrantPayload,
  PPDBListParams,
  Registrant,
  RegistrantDocument,
  RegistrationActionResponse,
  UpdateRegistrantPayload,
} from "./types";

// Daftar respons bisa berupa array + meta pagination
export interface RegistrantListResponse {
  success?: boolean;
  message: string;
  data: Registrant[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export const registrationService = {
  async list(params?: PPDBListParams): Promise<RegistrantListResponse> {
    return api.get<RegistrantListResponse>(PPDB.REGISTRATIONS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Registrant>> {
    return api.get<ApiEnvelope<Registrant>>(`${PPDB.REGISTRATIONS}/${id}`);
  },

  async create(payload: CreateRegistrantPayload): Promise<ApiEnvelope<Registrant>> {
    return api.post<ApiEnvelope<Registrant>>(PPDB.REGISTRATIONS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateRegistrantPayload,
  ): Promise<ApiEnvelope<Registrant>> {
    return api.put<ApiEnvelope<Registrant>>(
      `${PPDB.REGISTRATIONS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${PPDB.REGISTRATIONS}/${id}`);
  },
};

export const verificationService = {
  async verify(id: number | string): Promise<RegistrationActionResponse> {
    return api.post<RegistrationActionResponse>(
      PPDB.VERIFY.replace("{id}", String(id)),
    );
  },

  async reject(
    id: number | string,
    payload?: { verification_notes?: string },
  ): Promise<RegistrationActionResponse> {
    return api.post<RegistrationActionResponse>(
      PPDB.REJECT.replace("{id}", String(id)),
      payload,
    );
  },
};

export const reRegistrationService = {
  async verifyReRegistration(
    id: number | string,
    payload?: { re_registration_notes?: string },
  ): Promise<RegistrationActionResponse> {
    return api.post<RegistrationActionResponse>(
      `/re-registrants/${id}/verify-re-registration`,
      payload,
    );
  },

  async completeData(
    id: number | string,
    payload?: { notes?: string },
  ): Promise<RegistrationActionResponse> {
    return api.post<RegistrationActionResponse>(
      `/re-registrants/${id}/complete-data`,
      payload,
    );
  },
};

export const reRegistrantService = {
  async list(params?: PPDBListParams): Promise<RegistrantListResponse> {
    return api.get<RegistrantListResponse>(PPDB.RE_REGISTRANTS, params);
  },

  async exportList(params?: PPDBListParams): Promise<RegistrantListResponse> {
    return api.get<RegistrantListResponse>("/re-registrants/export-list", params);
  },

  async exportDapodik(params?: { id?: number | string; ids?: string }): Promise<Blob> {
    return api.get<Blob>("/re-registrants/export-dapodik", params, {
      responseType: "blob",
    });
  },
};

export const documentService = {
  async list(id: number | string): Promise<ApiEnvelope<RegistrantDocument[]>> {
    return api.get<ApiEnvelope<RegistrantDocument[]>>(
      `${PPDB.REGISTRATIONS}/${id}/documents`,
    );
  },

  async upload(id: number | string, formData: FormData): Promise<ApiEnvelope<RegistrantDocument>> {
    return api.post<ApiEnvelope<RegistrantDocument>>(
      `${PPDB.REGISTRATIONS}/${id}/documents`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  async remove(id: number | string, type: string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(
      `${PPDB.REGISTRATIONS}/${id}/documents/${type}`,
    );
  },
};
