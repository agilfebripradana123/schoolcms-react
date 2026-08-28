import type { ListParams } from "@/types";

export interface Teacher {
  id: number;
  user_id?: number | null;
  teacher_code?: string | null;
  nip?: string | null;
  full_name: string;
  prefix_title?: string | null;
  suffix_title?: string | null;
  phone?: string | null;
  email?: string | null;
  last_education?: string | null;
  major?: string | null;
  employment_status?: string | null;
  join_date?: string | null;
  photo?: string | null;
  is_active?: boolean;
  address?: string | null;
  gender?: "L" | "P" | null;
  birth_place?: string | null;
  birth_date?: string | null;
  religion?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CreateTeacherPayload {
  user_id?: number;
  teacher_code?: string;
  nip?: string;
  full_name: string;
  prefix_title?: string;
  suffix_title?: string;
  phone?: string;
  email?: string;
  last_education?: string;
  major?: string;
  employment_status?: string;
  join_date?: string;
  photo?: string;
  is_active?: boolean;
  address?: string;
  gender?: "L" | "P";
  birth_place?: string;
  birth_date?: string;
  religion?: string;
}

export interface UpdateTeacherPayload extends Partial<CreateTeacherPayload> {}

export interface Staff {
  id: number;
  user_id?: number | null;
  staff_number?: string | null;
  name: string;
  position?: string | null;
  department?: string | null;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateStaffPayload {
  user_id?: number;
  staff_number?: string;
  name: string;
  position?: string;
  department?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

export interface UpdateStaffPayload extends Partial<CreateStaffPayload> {}

export interface TeacherAssignment {
  id: number;
  teacher_id?: number;
  class_id?: number;
  subject_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTeacherAssignmentPayload {
  teacher_id?: number;
  class_id?: number;
  subject_id?: number;
}

export interface UpdateTeacherAssignmentPayload
  extends Partial<CreateTeacherAssignmentPayload> {}

export interface TeacherAttendance {
  id: number;
  teacher_id?: number;
  date?: string;
  status?: string;
  check_in?: string | null;
  check_out?: string | null;
  notes?: string | null;
  teacher?: Teacher | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTeacherAttendancePayload {
  teacher_id?: number;
  date?: string;
  status?: string;
  check_in?: string;
  check_out?: string;
  notes?: string;
}

export interface UpdateTeacherAttendancePayload
  extends Partial<CreateTeacherAttendancePayload> {}

export interface TeacherLeave {
  id: number;
  teacher_id?: number;
  leave_type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  reason?: string | null;
  status?: string | null;
  approved_by?: number | null;
  approved_at?: string | null;
  teacher?: Teacher | null;
  approver?: Teacher | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTeacherLeavePayload {
  teacher_id?: number;
  leave_type?: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
  status?: string;
}

export interface UpdateTeacherLeavePayload
  extends Partial<CreateTeacherLeavePayload> {}

export interface TeacherDocument {
  id: number;
  teacher_id?: number;
  title?: string;
  document_type?: string | null;
  file_path?: string | null;
  issued_date?: string | null;
  notes?: string | null;
  teacher?: Teacher | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTeacherDocumentPayload {
  teacher_id?: number;
  title?: string;
  document_type?: string;
  file_path?: string;
  issued_date?: string;
  notes?: string;
}

export interface UpdateTeacherDocumentPayload
  extends Partial<CreateTeacherDocumentPayload> {}

export interface TeacherListParams extends ListParams {
  class_id?: number;
  subject_id?: number;
  status?: string;
}

export function formatTeacherName(t: Pick<Teacher, "prefix_title" | "full_name" | "suffix_title">): string {
  return [t.prefix_title, t.full_name, t.suffix_title].filter(Boolean).join(" ");
}
