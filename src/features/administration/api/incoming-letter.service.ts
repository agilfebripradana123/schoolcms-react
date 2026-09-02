import { api } from "@/lib/api";
import { ADMINISTRATION } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AdministrationListParams,
  AdministrationListResponse,
  CreateIncomingLetterPayload,
  IncomingLetter,
  UpdateIncomingLetterPayload,
} from "./types";

export const incomingLetterService = {
  async list(
    params?: AdministrationListParams,
  ): Promise<AdministrationListResponse<IncomingLetter[]>> {
    return api.get<AdministrationListResponse<IncomingLetter[]>>(
      ADMINISTRATION.INCOMING_LETTERS,
      params,
    );
  },

  async get(id: number | string): Promise<ApiEnvelope<IncomingLetter>> {
    return api.get<ApiEnvelope<IncomingLetter>>(
      `${ADMINISTRATION.INCOMING_LETTERS}/${id}`,
    );
  },

  async create(
    payload: CreateIncomingLetterPayload,
  ): Promise<ApiEnvelope<IncomingLetter>> {
    return api.post<ApiEnvelope<IncomingLetter>>(
      ADMINISTRATION.INCOMING_LETTERS,
      payload,
    );
  },

  async update(
    id: number | string,
    payload: UpdateIncomingLetterPayload,
  ): Promise<ApiEnvelope<IncomingLetter>> {
    return api.put<ApiEnvelope<IncomingLetter>>(
      `${ADMINISTRATION.INCOMING_LETTERS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${ADMINISTRATION.INCOMING_LETTERS}/${id}`);
  },
};