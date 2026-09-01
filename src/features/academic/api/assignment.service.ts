import { api } from "@/lib/api";
import { ACADEMIC } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AcademicListParams,
  Assignment,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from "./types";

export interface AssignmentListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface AssignmentListResponse {
  success: boolean;
  message: string;
  data: Assignment[];
  meta: AssignmentListMeta;
}

export const assignmentService = {
  async list(params?: AcademicListParams): Promise<AssignmentListResponse> {
    return api.get<AssignmentListResponse>(ACADEMIC.ASSIGNMENTS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Assignment>> {
    return api.get<ApiEnvelope<Assignment>>(`${ACADEMIC.ASSIGNMENTS}/${id}`);
  },

  async create(payload: CreateAssignmentPayload): Promise<ApiEnvelope<Assignment>> {
    return api.post<ApiEnvelope<Assignment>>(ACADEMIC.ASSIGNMENTS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateAssignmentPayload,
  ): Promise<ApiEnvelope<Assignment>> {
    return api.put<ApiEnvelope<Assignment>>(
      `${ACADEMIC.ASSIGNMENTS}/${id}`,
      payload,
    );
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${ACADEMIC.ASSIGNMENTS}/${id}`);
  },
};
