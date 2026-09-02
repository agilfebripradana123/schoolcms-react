import { api } from "@/lib/api";
import { ADMINISTRATION } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AdministrationListParams,
  AdministrationListResponse,
  CreateOutgoingLetterPayload,
  OutgoingLetter,
  UpdateOutgoingLetterPayload,
} from "./types";

export const outgoingLetterService = {
  async list(
    params?: AdministrationListParams,
  ): Promise<AdministrationListResponse<OutgoingLetter[]>> {
    return api.get<AdministrationListResponse<OutgoingLetter[]>>(
      ADMINISTRATION.OUTGOING_LETTERS,
      params,
    );
  },

  async get(id: number | string): Promise<ApiEnvelope<OutgoingLetter>> {
    return api.get<ApiEnvelope<OutgoingLetter>>(
      `${ADMINISTRATION.OUTGOING_LETTERS}/${id}`,
    );
  },

  async create(
    payload: CreateOutgoingLetterPayload,
  ): Promise<ApiEnvelope<OutgoingLetter>> {
    return api.post<ApiEnvelope<OutgoingLetter>>(
      ADMINISTRATION.OUTGOING_LETTERS,
      payload,
    );
  },

  async update(
    id: number | string,
    payload: UpdateOutgoingLetterPayload,
  ): Promise<ApiEnvelope<OutgoingLetter>> {
    return api.put<ApiEnvelope<OutgoingLetter>>(
      `${ADMINISTRATION.OUTGOING_LETTERS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${ADMINISTRATION.OUTGOING_LETTERS}/${id}`);
  },
};