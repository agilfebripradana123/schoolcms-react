import type { ListParams } from "@/types";

export interface Teacher {
  id: number;
  user_id?: number | null;
  employee_number?: string;
  name: string;
  position?: string | null;
  phone?: string | null;
  email?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTeacherPayload {
  user_id?: number;
  employee_number?: string;
  name: string;
  position?: string;
  phone?: string;
  email?: string;
}

export interface UpdateTeacherPayload extends Partial<CreateTeacherPayload> {}

export interface Staff {
  id: number;
  user_id?: number | null;
  employee_number?: string;
  name: string;
  position?: string | null;
  department?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateStaffPayload {
  user_id?: number;
  employee_number?: string;
  name: string;
  position?: string;
  department?: string;
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
  note?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTeacherAttendancePayload {
  teacher_id?: number;
  date?: string;
  status?: string;
  note?: string;
}

export interface UpdateTeacherAttendancePayload
  extends Partial<CreateTeacherAttendancePayload> {}

export interface TeacherLeave {
  id: number;
  teacher_id?: number;
  start_date?: string;
  end_date?: string;
  reason?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTeacherLeavePayload {
  teacher_id?: number;
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
  name?: string;
  file_path?: string | null;
  type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTeacherDocumentPayload {
  teacher_id?: number;
  name?: string;
  file_path?: string;
  type?: string;
}

export interface UpdateTeacherDocumentPayload
  extends Partial<CreateTeacherDocumentPayload> {}

export interface TeacherListParams extends ListParams {
  class_id?: number;
  subject_id?: number;
  status?: string;
}
