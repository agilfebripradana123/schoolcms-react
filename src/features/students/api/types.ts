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
  father_name?: string | null;
  mother_name?: string | null;
  father_occupation?: string | null;
  mother_occupation?: string | null;
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

export interface Guardian {
  id: number;
  student_id?: number;
  name?: string;
  relation?: string;
  phone?: string | null;
  occupation?: string | null;
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
