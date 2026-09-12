import type { ListParams } from "@/types";

/** Akun login (relasi `user`) yang dikembalikan endpoint detail siswa. */
export interface StudentUser {
  id: number;
  role_id?: number | null;
  name: string;
  username?: string | null;
  email?: string | null;
  photo?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Student {
  id: number;
  user_id?: number | null;
  class_id?: number | null;

  // Identitas
  nisn: string;
  nis: string;
  name: string;
  nik?: string | null;
  religion?: string | null;
  gender: "L" | "P";
  birth_place: string;
  birth_date: string;

  // Kontak
  phone?: string | null;
  telephone?: string | null;
  email?: string | null;

  // Alamat
  address: string;
  rt?: string | null;
  rw?: string | null;
  hamlet?: string | null;
  village?: string | null;
  district?: string | null;
  postal_code?: string | null;
  residence_type?: string | null;
  transportation?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;

  // Dokumen & riwayat pendidikan
  family_card_number?: string | null;
  birth_certificate_registration_number?: string | null;
  skhun?: string | null;
  previous_school?: string | null;
  national_exam_number?: string | null;
  diploma_serial_number?: string | null;

  // Data fisik & kondisi
  special_needs?: string | null;
  birth_order?: number | null;
  sibling_count?: number | null;
  weight?: string | number | null;
  height?: string | number | null;
  head_circumference?: string | number | null;
  school_distance?: string | number | null;

  // Kesejahteraan
  kps_recipient?: boolean;
  kps_number?: string | null;
  kip_recipient?: boolean;
  kip_number?: string | null;
  kip_name?: string | null;
  kks_number?: string | null;
  pip_eligible?: boolean;
  pip_reason?: string | null;

  // Bank
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_holder?: string | null;

  photo?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;

  // Relasi (hanya diambil endpoint detail)
  user?: StudentUser | null;
  school_class?: SchoolClassLike | null;
  parent?: StudentParent | null;
  guardians?: Guardian[] | null;
}

export interface CreateStudentPayload {
  user_id?: number;
  class_id?: number;
  nisn: string;
  nis: string;
  name: string;
  gender: "L" | "P";
  birth_place: string;
  birth_date: string;
  address: string;
  phone?: string;
  photo?: string;
}

export interface UpdateStudentPayload extends Partial<CreateStudentPayload> {}

export interface StudentParent {
  id: number;
  student_id?: number;
  father_name?: string | null;
  father_birth_year?: number | null;
  father_education?: string | null;
  father_occupation?: string | null;
  father_income?: string | null;
  father_nik?: string | null;
  mother_name?: string | null;
  mother_birth_year?: number | null;
  mother_education?: string | null;
  mother_occupation?: string | null;
  mother_income?: string | null;
  mother_nik?: string | null;
  phone?: string | null;
  address?: string | null;
  student?: Student | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateStudentParentPayload {
  student_id?: number;
  father_name?: string;
  mother_name?: string;
  father_occupation?: string;
  mother_occupation?: string;
  phone?: string;
  address?: string;
}

export interface UpdateStudentParentPayload
  extends Partial<CreateStudentParentPayload> {}

export type GuardianRelation =
  | "ayah"
  | "ibu"
  | "kakek"
  | "nenek"
  | "paman"
  | "bibi"
  | "lainnya";

export interface Guardian {
  id: number;
  student_id?: number;
  name?: string;
  nik?: string | null;
  birth_year?: number | null;
  education?: string | null;
  relation?: GuardianRelation | string;
  phone?: string | null;
  occupation?: string | null;
  income?: string | null;
  address?: string | null;
  student?: Student | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateGuardianPayload {
  student_id?: number;
  name?: string;
  relation?: string;
  phone?: string;
  occupation?: string;
  address?: string;
}

export interface UpdateGuardianPayload extends Partial<CreateGuardianPayload> {}

export interface StudentHistory {
  id: number;
  student_id?: number;
  class_id?: number;
  academic_year_id?: number;
  status?: string;
  notes?: string | null;
  student?: Student | null;
  class?: SchoolClassLike | null;
  academic_year?: AcademicYearLike | null;
  created_at?: string;
  updated_at?: string;
}

export interface SchoolClassLike {
  id: number;
  name: string;
  teacher_id?: number | null;
  level?: string;
  academic_year?: string;
}

export interface AcademicYearLike {
  id: number;
  name: string;
  is_active?: boolean;
}

export interface CreateStudentHistoryPayload {
  student_id?: number;
  class_id?: number;
  academic_year_id?: number;
  status?: string;
  notes?: string;
}

export interface UpdateStudentHistoryPayload
  extends Partial<CreateStudentHistoryPayload> {}

export interface Attendance {
  id: number;
  student_id?: number;
  class_id?: number;
  date?: string;
  status?: string;
  note?: string | null;
  student?: Student | null;
  class?: SchoolClassLike | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAttendancePayload {
  student_id?: number;
  class_id?: number;
  date?: string;
  status?: string;
  note?: string;
}

export interface UpdateAttendancePayload extends Partial<CreateAttendancePayload> {}

export interface Transfer {
  id: number;
  student_id?: number;
  type?: string;
  from_school?: string | null;
  to_school?: string | null;
  transfer_date?: string | null;
  reason?: string | null;
  student?: Student | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTransferPayload {
  student_id?: number;
  type?: string;
  from_school?: string;
  to_school?: string;
  transfer_date?: string;
  reason?: string;
}

export interface UpdateTransferPayload extends Partial<CreateTransferPayload> {}

export interface Alumni {
  id: number;
  student_id?: number | null;
  name: string;
  graduation_year?: number;
  phone?: string | null;
  email?: string | null;
  occupation?: string | null;
  student?: Student | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAlumniPayload {
  student_id?: number;
  name: string;
  graduation_year?: number;
  phone?: string;
  email?: string;
  occupation?: string;
}

export interface UpdateAlumniPayload extends Partial<CreateAlumniPayload> {}

export interface StudentIdCard {
  id: number;
  student_id?: number;
  card_number?: string;
  issued_date?: string | null;
  valid_until?: string | null;
  status?: string;
  student?: Student | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateStudentIdCardPayload {
  student_id?: number;
  card_number?: string;
  issued_date?: string;
  valid_until?: string;
  status?: string;
}

export interface UpdateStudentIdCardPayload
  extends Partial<CreateStudentIdCardPayload> {}

export interface StudentListParams extends ListParams {
  class_id?: number;
  academic_year_id?: number;
  gender?: "L" | "P";
  status?: string;
}
