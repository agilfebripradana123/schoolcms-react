import type { ListParams } from "@/types";

export interface Student {
  id: number;
  user_id?: number | null;
  class_id?: number | null;
  nisn: string;
  nis: string;
  name: string;
  gender: "L" | "P";
  birth_place: string;
  birth_date: string;
  address: string;
  phone?: string | null;
  photo?: string | null;
  created_at?: string;
  updated_at?: string;
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
  name?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateStudentParentPayload {
  student_id?: number;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateStudentParentPayload
  extends Partial<CreateStudentParentPayload> {}

export interface Guardian {
  id: number;
  student_id?: number;
  name?: string;
  relationship?: string;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateGuardianPayload {
  student_id?: number;
  name?: string;
  relationship?: string;
  phone?: string;
}

export interface UpdateGuardianPayload extends Partial<CreateGuardianPayload> {}

export interface StudentHistory {
  id: number;
  student_id?: number;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateStudentHistoryPayload {
  student_id?: number;
  description?: string;
}

export interface UpdateStudentHistoryPayload
  extends Partial<CreateStudentHistoryPayload> {}

export interface Attendance {
  id: number;
  student_id?: number;
  date?: string;
  status?: string;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAttendancePayload {
  student_id?: number;
  date?: string;
  status?: string;
  note?: string;
}

export interface UpdateAttendancePayload extends Partial<CreateAttendancePayload> {}

export interface Transfer {
  id: number;
  student_id?: number;
  from_class_id?: number;
  to_class_id?: number;
  transfer_date?: string;
  reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTransferPayload {
  student_id?: number;
  from_class_id?: number;
  to_class_id?: number;
  transfer_date?: string;
  reason?: string;
}

export interface UpdateTransferPayload extends Partial<CreateTransferPayload> {}

export interface Alumni {
  id: number;
  student_id?: number;
  graduation_year?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAlumniPayload {
  student_id?: number;
  graduation_year?: number;
  status?: string;
}

export interface UpdateAlumniPayload extends Partial<CreateAlumniPayload> {}

export interface StudentIdCard {
  id: number;
  student_id?: number;
  card_number?: string;
  issued_at?: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateStudentIdCardPayload {
  student_id?: number;
  card_number?: string;
  issued_at?: string;
  expires_at?: string;
}

export interface UpdateStudentIdCardPayload
  extends Partial<CreateStudentIdCardPayload> {}

export interface StudentListParams extends ListParams {
  class_id?: number;
  academic_year_id?: number;
  gender?: "L" | "P";
  status?: string;
}
