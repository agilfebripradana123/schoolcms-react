import type { ListParams } from "@/types";

export interface Registrant {
  id: number;
  student_id?: number | null;
  registration_number?: string;
  name: string;
  origin_school?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRegistrantPayload {
  student_id?: number;
  registration_number?: string;
  name: string;
  origin_school?: string;
  status?: string;
}

export interface UpdateRegistrantPayload extends Partial<CreateRegistrantPayload> {}

export interface PPDBListParams extends ListParams {
  status?: string;
  academic_year_id?: number;
}

export interface RegistrationActionResponse {
  success?: boolean;
  message: string;
  data?: unknown;
}
