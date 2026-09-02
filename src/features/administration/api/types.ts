import type { ListParams } from "@/types";

/* ── Surat Masuk ── */

export type LetterCategory = "undangan" | "permohonan" | "pemberitahuan" | "lainnya";

export type IncomingLetterStatus = "baru" | "diproses" | "selesai" | "diarsipkan";

export interface IncomingLetter {
  id: number;
  letter_number: string;
  sender: string;
  subject: string;
  received_date: string;
  letter_date?: string | null;
  category: LetterCategory;
  is_important: boolean;
  status: IncomingLetterStatus;
  file_path?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateIncomingLetterPayload {
  letter_number: string;
  sender: string;
  subject: string;
  received_date: string;
  letter_date?: string | null;
  category: LetterCategory;
  is_important: boolean;
  status?: IncomingLetterStatus;
  file_path?: string | null;
  notes?: string | null;
}

export interface UpdateIncomingLetterPayload
  extends Partial<CreateIncomingLetterPayload> {}

/* ── Surat Keluar ── */

export type OutgoingLetterStatus = "draft" | "terkirim" | "diarsipkan";

export interface OutgoingLetter {
  id: number;
  letter_number: string;
  recipient: string;
  subject: string;
  letter_date: string;
  sent_date?: string | null;
  category: LetterCategory;
  status: OutgoingLetterStatus;
  file_path?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateOutgoingLetterPayload {
  letter_number: string;
  recipient: string;
  subject: string;
  letter_date: string;
  sent_date?: string | null;
  category: LetterCategory;
  status?: OutgoingLetterStatus;
  file_path?: string | null;
  notes?: string | null;
}

export interface UpdateOutgoingLetterPayload
  extends Partial<CreateOutgoingLetterPayload> {}

/* ── Disposisi ── */

export type DispositionStatus = "belum" | "proses" | "selesai";

export interface Disposition {
  id: number;
  incoming_letter_id: number;
  assigned_to: string;
  instruction?: string | null;
  due_date?: string | null;
  status: DispositionStatus;
  completed_at?: string | null;
  incoming_letter?: IncomingLetter | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDispositionPayload {
  incoming_letter_id: number;
  assigned_to: string;
  instruction?: string | null;
  due_date?: string | null;
  status?: DispositionStatus;
  completed_at?: string | null;
}

export interface UpdateDispositionPayload extends Partial<CreateDispositionPayload> {}

/* ── Dokumen ── */

export type DocumentCategory =
  | "sk"
  | "peraturan"
  | "sop"
  | "laporan"
  | "formulir"
  | "lainnya";

export interface Document {
  id: number;
  title: string;
  document_number?: string | null;
  category: DocumentCategory;
  file_path?: string | null;
  document_date?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDocumentPayload {
  title: string;
  document_number?: string | null;
  category: DocumentCategory;
  file_path?: string | null;
  document_date?: string | null;
  description?: string | null;
}

export interface UpdateDocumentPayload extends Partial<CreateDocumentPayload> {}

/* ── List (pagination) ── */

export interface AdministrationListParams extends ListParams {
  q?: string;
  status?: string;
  category?: string;
  is_important?: boolean;
  incoming_letter_id?: number;
}

export interface AdministrationListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface AdministrationListResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: AdministrationListMeta;
}