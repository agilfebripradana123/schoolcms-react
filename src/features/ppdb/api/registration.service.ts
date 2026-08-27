import { api } from "@/lib/api";
import { PPDB } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateRegistrantPayload,
  PPDBListParams,
  Registrant,
  RegistrationActionResponse,
  UpdateRegistrantPayload,
} from "./types";

export const registrationService = {
  async list(params?: PPDBListParams): Promise<ApiEnvelope<Registrant[]>> {
    return api.get<ApiEnvelope<Registrant[]>>(PPDB.REGISTRATIONS, params);
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

  async reject(id: number | string): Promise<RegistrationActionResponse> {
    return api.post<RegistrationActionResponse>(
      PPDB.REJECT.replace("{id}", String(id)),
    );
  },
};

export const selectionService = {
  async select(id: number | string): Promise<RegistrationActionResponse> {
    return api.post<RegistrationActionResponse>(
      PPDB.SELECT.replace("{id}", String(id)),
    );
  },

  async notSelect(id: number | string): Promise<RegistrationActionResponse> {
    return api.post<RegistrationActionResponse>(
      PPDB.NOT_SELECT.replace("{id}", String(id)),
    );
  },
};

export const reRegistrationService = {
  async reRegister(id: number | string): Promise<RegistrationActionResponse> {
    return api.post<RegistrationActionResponse>(
      PPDB.RE_REGISTER.replace("{id}", String(id)),
    );
  },

  async verifyReRegistration(
    id: number | string,
  ): Promise<RegistrationActionResponse> {
    return api.post<RegistrationActionResponse>(
      PPDB.VERIFY_RE_REGISTER.replace("{id}", String(id)),
    );
  },
};
