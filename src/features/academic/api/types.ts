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
export type ScheduleDay = "senin" | "selasa" | "rabu" | "kamis" | "jumat" | "sabtu";

export interface Schedule {
  id: number;
  class_id: number;
  subject_id: number;
  teacher_id?: number | null;
  day: ScheduleDay;
  period_id: number;
  academic_year_id: number;
  semester_id?: number | null;
  class?: SchoolClass;
  subject?: Subject;
  teacher?: Teacher;
  period?: Period;
  academic_year?: AcademicYear;
  semester?: Semester;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSchedulePayload {
  class_id: number;
  subject_id: number;
  teacher_id?: number | null;
  day: ScheduleDay;
  period_id: number;
  academic_year_id: number;
  semester_id?: number | null;
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
  subject_id: number;
  class_id: number;
  teacher_id?: number | null;
  due_date?: string;
  academic_year_id: number;
  subject?: Subject;
  class?: SchoolClass;
  teacher?: Teacher;
  academic_year?: AcademicYear;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAssignmentPayload {
  title: string;
  description?: string;
  subject_id: number;
  class_id: number;
  teacher_id?: number | null;
  due_date?: string;
  academic_year_id: number;
}

export interface UpdateAssignmentPayload extends Partial<CreateAssignmentPayload> {}

// ---- Grade ----
export type GradeType = "tugas" | "uts" | "uas";

export interface Grade {
  id: number;
  student_id: number;
  subject_id: number;
  class_id: number;
  type: GradeType;
  score: number;
  semester: string;
  academic_year: string;
  student?: Student;
  subject?: Subject;
  class?: SchoolClass;
  created_at?: string;
  updated_at?: string;
}

export interface CreateGradePayload {
  student_id: number;
  subject_id: number;
  class_id: number;
  type: GradeType;
  score: number;
  semester: string;
  academic_year: string;
}

export interface UpdateGradePayload extends Partial<CreateGradePayload> {}

// ---- Report Card ----
export type ReportCardStatus = "draft" | "published";

export interface ReportCard {
  id: number;
  student_id: number;
  class_id: number;
  academic_year_id: number;
  semester_id: number;
  teacher_notes?: string | null;
  status: ReportCardStatus;
  published_at?: string | null;
  student?: Student;
  class?: SchoolClass;
  academic_year?: AcademicYear;
  semester?: Semester;
  created_at?: string;
  updated_at?: string;
}

export interface CreateReportCardPayload {
  student_id: number;
  class_id: number;
  academic_year_id: number;
  semester_id: number;
  teacher_notes?: string;
  status: ReportCardStatus;
  published_at?: string;
}

export interface UpdateReportCardPayload extends Partial<CreateReportCardPayload> {}

export interface AcademicListParams extends ListParams {
  academic_year_id?: number;
  semester_id?: number;
  class_id?: number;
  subject_id?: number;
}

// ---- Teacher self-service: Kelas & Siswa (Portal Guru) ----
// Backend resolves data scope from the authenticated user, so the client never
// passes teacher_id. `TeacherClass` extends the shared `SchoolClass` with the
// teacher-scoped fields the self-service endpoint returns.

export interface TeacherClassWali {
  id: number;
  full_name: string;
}

export interface TeacherClass extends SchoolClass {
  students_count: number;
  wali_kelas?: TeacherClassWali | null;
}

export interface TeacherClassStudentSlim {
  id: number;
  nisn?: string;
  nis?: string;
  name: string;
  gender?: "L" | "P" | null;
}

export interface TeacherClassStudent {
  id: number;
  class_id: number;
  student_id: number;
  status: string;
  student?: TeacherClassStudentSlim | null;
}

export interface TeacherClassStudentsListParams extends ListParams {
  q?: string;
  page?: number;
  per_page?: number;
}

// ---- Teacher self-service: Jadwal Mengajar (Portal Guru) ----
// Response slim dari /api/teacher/schedules (scope dari user login).

export interface TeacherSchedulePeriodRef {
  id: number;
  name?: string;
  start_time?: string | null;
  end_time?: string | null;
}

export interface TeacherScheduleSubjectRef {
  id: number;
  name?: string;
}

export interface TeacherScheduleClassRef {
  id: number;
  name?: string;
  level?: string | null;
}

export interface TeacherScheduleYearRef {
  id: number;
  name?: string;
}

export interface TeacherSchedule {
  id: number;
  day: ScheduleDay;
  period?: TeacherSchedulePeriodRef | null;
  subject?: TeacherScheduleSubjectRef | null;
  class?: TeacherScheduleClassRef | null;
  academic_year?: TeacherScheduleYearRef | null;
  semester?: TeacherScheduleYearRef | null;
}

export interface TeacherScheduleListParams extends ListParams {
  day?: ScheduleDay;
  academic_year_id?: number;
  semester_id?: number;
  class_id?: number;
  subject_id?: number;
}

export const SCHEDULE_DAYS: ScheduleDay[] = [
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
];

export const SCHEDULE_DAY_LABELS: Record<ScheduleDay, string> = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
};

// ---- Teacher self-service: Kehadiran Siswa (Portal Guru) ----
// Status mengikuti nilai backend (bahasa Indonesia).

export const ATTENDANCE_STATUSES = ["hadir", "sakit", "izin", "alpa"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  hadir: "Hadir",
  sakit: "Sakit",
  izin: "Izin",
  alpa: "Alpa",
};

export interface TeacherAttendanceStudent {
  student_id: number;
  nis: string;
  nisn: string;
  name: string;
  gender?: "L" | "P" | null;
  status: AttendanceStatus | null;
  note?: string | null;
}

export interface TeacherAttendanceRoster {
  class_id: number;
  date: string;
  students: TeacherAttendanceStudent[];
}

export interface TeacherAttendanceSaveItem {
  student_id: number;
  status: AttendanceStatus;
  note?: string | null;
}

export interface TeacherAttendanceSavePayload {
  class_id: number;
  date: string;
  items: TeacherAttendanceSaveItem[];
}

// ---- Teacher self-service: Nilai (Portal Guru) ----
// Grade bersifat komponen (type = tugas/uts/uas), scope = TeacherAssignment.

export const GRADE_TYPES = ["tugas", "uts", "uas"] as const;

export const GRADE_TYPE_LABELS: Record<GradeType, string> = {
  tugas: "Tugas",
  uts: "UTS",
  uas: "UAS",
};

export const SEMESTER_OPTIONS = [
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
] as const;

export interface TeacherGradeAssignment {
  id: number;
  class_id: number;
  class_name?: string;
  subject_id: number;
  subject_name?: string;
  academic_year_id: number;
  academic_year_name?: string;
}

export interface TeacherGradeStudent {
  student_id: number;
  nis: string;
  nisn: string;
  name: string;
  gender?: "L" | "P" | null;
  score: number | null;
}

export interface TeacherGradeRoster {
  class_id: number;
  subject_id: number;
  type: GradeType;
  semester: string;
  academic_year: string;
  students: TeacherGradeStudent[];
}

export interface TeacherGradeBulkItem {
  student_id: number;
  score: number | null;
}

export interface TeacherGradeBulkPayload {
  class_id: number;
  subject_id: number;
  type: GradeType;
  semester: string;
  academic_year?: string;
  academic_year_id?: number;
  items: TeacherGradeBulkItem[];
}
