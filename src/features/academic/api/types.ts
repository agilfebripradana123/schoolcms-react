import type { ListParams } from "@/types";

// ---- Academic Year ----
export interface AcademicYear {
  id: number;
  name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAcademicYearPayload {
  name: string;
  is_active?: boolean;
}

export interface UpdateAcademicYearPayload extends Partial<CreateAcademicYearPayload> {}

// ---- Semester ----
export interface Semester {
  id: number;
  academic_year_id: number;
  name: string;
  is_active?: boolean;
  academic_year?: AcademicYear;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSemesterPayload {
  academic_year_id: number;
  name: string;
  is_active?: boolean;
}

export interface UpdateSemesterPayload extends Partial<CreateSemesterPayload> {}

// ---- Curriculum ----
export interface Curriculum {
  id: number;
  name: string;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCurriculumPayload {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateCurriculumPayload extends Partial<CreateCurriculumPayload> {}

// ---- Subject ----
export type SubjectType = "wajib" | "pilihan";

export interface Subject {
  id: number;
  code: string;
  name: string;
  type: SubjectType;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSubjectPayload {
  code: string;
  name: string;
  type: SubjectType;
  description?: string;
}

export interface UpdateSubjectPayload extends Partial<CreateSubjectPayload> {}

// ---- Class ----
export interface SchoolClass {
  id: number;
  name: string;
  teacher_id?: number | null;
  level?: string;
  academic_year?: string;
}

export interface CreateSchoolClassPayload {
  name: string;
  teacher_id?: number | null;
  level?: string;
  academic_year?: string;
}

export interface UpdateSchoolClassPayload extends Partial<CreateSchoolClassPayload> {}

// ---- Class Subject ----
export interface Teacher {
  id: number;
  full_name?: string;
}

export interface ClassSubject {
  id: number;
  class_id: number;
  subject_id: number;
  teacher_id?: number | null;
  created_at?: string;
  updated_at?: string;
  class?: SchoolClass;
  subject?: Subject;
  teacher?: Teacher;
}

export interface CreateClassSubjectPayload {
  class_id: number;
  subject_id: number;
  teacher_id?: number | null;
}

export interface UpdateClassSubjectPayload extends Partial<CreateClassSubjectPayload> {}

// ---- Class Student ----
export type ClassStudentStatus = "active" | "moved" | "graduated";

export interface Student {
  id: number;
  name: string;
}

export interface ClassStudent {
  id: number;
  class_id: number;
  student_id: number;
  academic_year_id: number;
  status: ClassStudentStatus;
  created_at?: string;
  updated_at?: string;
  class?: SchoolClass;
  student?: Student;
  academic_year?: AcademicYear;
}

export interface CreateClassStudentPayload {
  class_id: number;
  student_id: number;
  academic_year_id: number;
  status: ClassStudentStatus;
}

export interface UpdateClassStudentPayload extends Partial<CreateClassStudentPayload> {}

// ---- Teacher Assignment ----
export interface TeacherAssignment {
  id: number;
  teacher_id: number;
  class_id: number;
  subject_id: number;
  academic_year_id: number;
  created_at?: string;
  updated_at?: string;
  teacher?: Teacher;
  class?: SchoolClass;
  subject?: Subject;
  academic_year?: AcademicYear;
}

export interface CreateTeacherAssignmentPayload {
  teacher_id: number;
  class_id: number;
  subject_id: number;
  academic_year_id: number;
}

export interface UpdateTeacherAssignmentPayload extends Partial<CreateTeacherAssignmentPayload> {}

// ---- Schedule ----
export interface Schedule {
  id: number;
  class_id?: number;
  subject_id?: number;
  day?: string;
  start_time?: string;
  end_time?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSchedulePayload {
  class_id?: number;
  subject_id?: number;
  day?: string;
  start_time?: string;
  end_time?: string;
}

export interface UpdateSchedulePayload extends Partial<CreateSchedulePayload> {}

// ---- Period ----
export interface Period {
  id: number;
  name: string;
  start_time?: string;
  end_time?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePeriodPayload {
  name: string;
  start_time?: string;
  end_time?: string;
}

export interface UpdatePeriodPayload extends Partial<CreatePeriodPayload> {}

// ---- Assignment ----
export interface Assignment {
  id: number;
  title: string;
  description?: string | null;
  class_id?: number;
  subject_id?: number;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAssignmentPayload {
  title: string;
  description?: string;
  class_id?: number;
  subject_id?: number;
  due_date?: string;
}

export interface UpdateAssignmentPayload extends Partial<CreateAssignmentPayload> {}

// ---- Grade ----
export interface Grade {
  id: number;
  student_id?: number;
  subject_id?: number;
  score?: number;
  grade?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateGradePayload {
  student_id?: number;
  subject_id?: number;
  score?: number;
  grade?: string;
}

export interface UpdateGradePayload extends Partial<CreateGradePayload> {}

// ---- Report Card ----
export interface ReportCard {
  id: number;
  student_id?: number;
  semester_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateReportCardPayload {
  student_id?: number;
  semester_id?: number;
}

export interface UpdateReportCardPayload extends Partial<CreateReportCardPayload> {}

export interface AcademicListParams extends ListParams {
  academic_year_id?: number;
  semester_id?: number;
  class_id?: number;
  subject_id?: number;
}
