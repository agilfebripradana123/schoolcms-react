import type { ListParams } from "@/types";

export interface IncomingLetter {
  id: number;
  letter_number?: string;
  subject?: string;
  sender?: string;
  date_received?: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateIncomingLetterPayload {
  letter_number?: string;
  subject?: string;
  sender?: string;
  date_received?: string;
  description?: string;
}

export interface UpdateIncomingLetterPayload
  extends Partial<CreateIncomingLetterPayload> {}

export interface OutgoingLetter {
  id: number;
  letter_number?: string;
  subject?: string;
  recipient?: string;
  date_sent?: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateOutgoingLetterPayload {
  letter_number?: string;
  subject?: string;
  recipient?: string;
  date_sent?: string;
  description?: string;
}

export interface UpdateOutgoingLetterPayload
  extends Partial<CreateOutgoingLetterPayload> {}

export interface Disposition {
  id: number;
  incoming_letter_id?: number;
  to_user_id?: number;
  instruction?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDispositionPayload {
  incoming_letter_id?: number;
  to_user_id?: number;
  instruction?: string;
  status?: string;
}

export interface UpdateDispositionPayload extends Partial<CreateDispositionPayload> {}

export interface AdministrationListParams extends ListParams {
  status?: string;
}
