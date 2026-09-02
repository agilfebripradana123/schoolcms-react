import { api } from "@/lib/api";
import { ADMINISTRATION } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AdministrationListParams,
  AdministrationListResponse,
  CreateDocumentPayload,
  Document,
  UpdateDocumentPayload,
} from "./types";

export const documentService = {
  async list(
    params?: AdministrationListParams,
  ): Promise<AdministrationListResponse<Document[]>> {
    return api.get<AdministrationListResponse<Document[]>>(
      ADMINISTRATION.DOCUMENTS,
      params,
    );
  },

  async get(id: number | string): Promise<ApiEnvelope<Document>> {
    return api.get<ApiEnvelope<Document>>(`${ADMINISTRATION.DOCUMENTS}/${id}`);
  },

  async create(payload: CreateDocumentPayload): Promise<ApiEnvelope<Document>> {
    return api.post<ApiEnvelope<Document>>(ADMINISTRATION.DOCUMENTS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateDocumentPayload,
  ): Promise<ApiEnvelope<Document>> {
    return api.put<ApiEnvelope<Document>>(
      `${ADMINISTRATION.DOCUMENTS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${ADMINISTRATION.DOCUMENTS}/${id}`);
  },
};