import type { ListParams } from "@/types";

export type Gender = "L" | "P";
export type Religion =
  | "islam"
  | "kristen"
  | "katolik"
  | "hindu"
  | "buddha"
  | "konghucu";
export type RegistrationPath = "prestasi" | "reguler" | "afirmasi" | "mutasi";
export type ProgramChoice = "ipa" | "ips" | "bahasa" | "lainnya";
export type Education = "sd" | "smp" | "sma" | "smk" | "d3" | "s1" | "s2" | "s3";

export interface Registrant {
  id: number;
  student_id?: number | null;
  registration_number?: string;
  // Identitas
  full_name: string;
  nik?: string | null;
  nisn?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: Gender | null;
  birth_place?: string | null;
  birth_date?: string | null;
  religion?: Religion | null;
  // Alamat
  address?: string | null;
  rt?: string | null;
  rw?: string | null;
  village?: string | null;
  district?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  // Asal sekolah
  previous_school?: string | null;
  previous_school_npsn?: string | null;
  graduation_year?: number | null;
  // Orang tua
  father_name?: string | null;
  father_nik?: string | null;
  father_education?: Education | null;
  father_occupation?: string | null;
  father_phone?: string | null;
  mother_name?: string | null;
  mother_nik?: string | null;
  mother_education?: Education | null;
  mother_occupation?: string | null;
  mother_phone?: string | null;
  // Wali
  guardian_name?: string | null;
  guardian_nik?: string | null;
  guardian_education?: Education | null;
  guardian_occupation?: string | null;
  guardian_phone?: string | null;
  // PPDB
  academic_year_id?: number | null;
  registration_path?: RegistrationPath | null;
  program_choice?: ProgramChoice | null;
  registration_date?: string | null;
  // Penilaian / status
  status?: string;
  verification_status?: string;
  verification_notes?: string | null;
  verified_by?: number | null;
  verified_at?: string | null;
  selection_status?: string;
  selection_score?: number | null;
  selected_at?: string | null;
  re_registration_status?: string;
  re_registration_date?: string | null;
  re_registration_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RegistrantAddressPayload {
  address?: string;
  rt?: string;
  rw?: string;
  village?: string;
  district?: string;
  city?: string;
  province?: string;
  postal_code?: string;
}

export interface RegistrantParentPayload {
  father_name?: string;
  father_nik?: string;
  father_education?: Education;
  father_occupation?: string;
  father_phone?: string;
  mother_name?: string;
  mother_nik?: string;
  mother_education?: Education;
  mother_occupation?: string;
  mother_phone?: string;
  guardian_name?: string;
  guardian_nik?: string;
  guardian_education?: Education;
  guardian_occupation?: string;
  guardian_phone?: string;
}

export interface CreateRegistrantPayload {
  // Identitas (wajib minimal)
  full_name: string;
  email?: string;
  gender?: Gender;
  nik?: string;
  nisn?: string;
  phone?: string;
  birth_place?: string;
  birth_date?: string;
  religion?: Religion;
  // Alamat
  address?: string;
  rt?: string;
  rw?: string;
  village?: string;
  district?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  // Asal sekolah
  previous_school?: string;
  previous_school_npsn?: string;
  graduation_year?: number;
  // Orang tua & wali
  father_name?: string;
  father_nik?: string;
  father_education?: Education;
  father_occupation?: string;
  father_phone?: string;
  mother_name?: string;
  mother_nik?: string;
  mother_education?: Education;
  mother_occupation?: string;
  mother_phone?: string;
  guardian_name?: string;
  guardian_nik?: string;
  guardian_education?: Education;
  guardian_occupation?: string;
  guardian_phone?: string;
  // PPDB
  academic_year_id?: number;
  registration_path?: RegistrationPath;
  program_choice?: ProgramChoice;
  registration_date?: string;
}

export interface UpdateRegistrantPayload extends Partial<CreateRegistrantPayload> {}

export interface PPDBListParams extends ListParams {
  academic_year_id?: number;
  registration_path?: RegistrationPath;
  program_choice?: ProgramChoice;
  status?: string;
  verification_status?: string;
  selection_status?: string;
  re_registration_status?: string;
}

export interface RegistrationActionResponse {
  success?: boolean;
  message: string;
  data?: Registrant | unknown;
}

export interface RegistrantDocument {
  id: number;
  registration_id?: number;
  type?: string;
  file_path?: string | null;
  name?: string | null;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
}
