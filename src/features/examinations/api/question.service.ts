import { api } from "@/lib/api";
import { EXAMINATION } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  CreateQuestionPayload,
  ExaminationListParams,
  ExaminationPaginatedResponse,
  QuestionBank,
  QuestionImportPreviewData,
  QuestionImportResultData,
  UpdateQuestionPayload,
} from "./types";

export const questionBankService = {
  async list(
    params?: ExaminationListParams,
  ): Promise<ExaminationPaginatedResponse<QuestionBank[]>> {
    return api.get<ExaminationPaginatedResponse<QuestionBank[]>>(
      EXAMINATION.QUESTIONS,
      params,
    );
  },

  async get(id: number | string): Promise<ApiEnvelope<QuestionBank>> {
    return api.get<ApiEnvelope<QuestionBank>>(`${EXAMINATION.QUESTIONS}/${id}`);
  },

  async create(payload: CreateQuestionPayload): Promise<ApiEnvelope<QuestionBank>> {
    return api.post<ApiEnvelope<QuestionBank>>(EXAMINATION.QUESTIONS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateQuestionPayload,
  ): Promise<ApiEnvelope<QuestionBank>> {
    return api.put<ApiEnvelope<QuestionBank>>(`${EXAMINATION.QUESTIONS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${EXAMINATION.QUESTIONS}/${id}`);
  },

  async downloadImportTemplate(): Promise<Blob> {
    return api.get<Blob>(EXAMINATION.QUESTIONS_IMPORT_TEMPLATE, undefined, {
      responseType: "blob",
    });
  },

  async previewImport(formData: FormData): Promise<ApiEnvelope<QuestionImportPreviewData>> {
    return api.post<ApiEnvelope<QuestionImportPreviewData>>(
      EXAMINATION.QUESTIONS_IMPORT_PREVIEW,
      formData,
    );
  },

  async importQuestions(formData: FormData): Promise<ApiEnvelope<QuestionImportResultData>> {
    return api.post<ApiEnvelope<QuestionImportResultData>>(
      EXAMINATION.QUESTIONS_IMPORT,
      formData,
    );
  },
};
