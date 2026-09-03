/* ── Shared pagination ── */

export interface ReportPaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

/* ── Academic (grades summary) ── */

export interface AcademicGradesSummaryRow {
  student_id: number;
  student_name: string;
  average_score: number | string;
  total_grades: number | string;
}

export interface AcademicGradesSummaryResponse {
  success: boolean;
  message: string;
  data: AcademicGradesSummaryRow[];
  meta: ReportPaginationMeta;
}

export interface AcademicGradesSummaryParams {
  class_id?: number;
  subject_id?: number;
  semester?: "1" | "2";
  academic_year?: string;
  per_page?: number;
  page?: number;
  [key: string]: string | number | boolean | null | undefined;
}

/* ── Students ── */

export interface StudentReportSummary {
  totals: {
    total_students: number;
    total_classes: number;
  };
  per_class: Array<{
    class_id: number;
    class_name: string;
    total_students: number | string;
  }>;
  gender_distribution: {
    L: number;
    P: number;
  };
}

export interface StudentReportResponse {
  success: boolean;
  message: string;
  data: StudentReportSummary;
}

/* ── Teachers ── */

export interface TeacherReportSummary {
  total_teachers: number;
  active_teachers: number;
  employment_breakdown: Array<{
    employment_status: string;
    total: number | string;
  }>;
}

export interface TeacherReportResponse {
  success: boolean;
  message: string;
  data: TeacherReportSummary;
}

export interface TeacherAttendanceSummaryRow {
  teacher_id: number;
  teacher_name: string;
  hadir: number | string;
  sakit: number | string;
  izin: number | string;
  alfa: number | string;
  terlambat: number | string;
  total_days: number | string;
}

export interface TeacherAttendanceSummaryResponse {
  success: boolean;
  message: string;
  data: TeacherAttendanceSummaryRow[];
  meta: ReportPaginationMeta;
}

export interface TeacherAttendanceSummaryParams {
  date_from?: string;
  date_end?: string;
  per_page?: number;
  page?: number;
  [key: string]: string | number | boolean | null | undefined;
}

/* ── Finance ── */

export interface FinanceReportSummary {
  totals: {
    total_billed: number;
    total_paid: number;
    total_outstanding: number;
  };
  per_fee_type: Array<{
    fee_type_name: string;
    total_billed: number;
    total_paid: number;
  }>;
  monthly_trend: Array<{
    month: string;
    total_paid: number;
  }>;
}

export interface FinanceReportResponse {
  success: boolean;
  message: string;
  data: FinanceReportSummary;
}

export interface FinanceSummaryParams {
  date_from?: string;
  date_to?: string;
  academic_year_id?: number;
  semester_id?: number;
  fee_type_id?: number;
  [key: string]: string | number | boolean | null | undefined;
}

/* ── Attendance ── */

export interface AttendanceStatusTotals {
  hadir: number;
  sakit: number;
  izin: number;
  alfa: number;
}

export interface AttendanceDailyReport {
  date: string;
  totals: AttendanceStatusTotals;
  per_class: Array<{
    class_id: number | null;
    class_name: string | null;
    hadir: number;
    sakit: number;
    izin: number;
    alfa: number;
  }>;
}

export interface AttendanceDailyResponse {
  success: boolean;
  message: string;
  data: AttendanceDailyReport;
}

export interface AttendanceDailyParams {
  date: string;
  class_id?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface AttendanceStudentSummaryRow {
  student_id: number;
  student_name: string;
  total_days: number;
  hadir: number;
  sakit: number;
  izin: number;
  alfa: number;
  attendance_percentage: number;
}

export interface AttendanceStudentSummaryResponse {
  success: boolean;
  message: string;
  data: AttendanceStudentSummaryRow[];
  meta: ReportPaginationMeta;
}

export interface AttendanceStudentSummaryParams {
  date_from?: string;
  date_end?: string;
  class_id?: number;
  per_page?: number;
  page?: number;
  [key: string]: string | number | boolean | null | undefined;
}

/* ── Inventory ── */

export type InventoryStockStatus = "low" | "warning" | "healthy";

export interface InventoryStockSummary {
  items: Array<{
    id: number;
    code: string;
    name: string;
    category: string;
    unit: string | null;
    quantity: number;
    minimum_stock: number;
    location: string | null;
    stock_status: InventoryStockStatus;
  }>;
  totals: {
    total_items: number;
    total_low_stock: number;
    categories: Array<{
      category: string;
      total_items: number;
    }>;
  };
}

export interface InventoryStockResponse {
  success: boolean;
  message: string;
  data: InventoryStockSummary;
}

export interface InventoryMovementSummary {
  totals_by_type: Record<string, number>;
  recent: Array<{
    id: number;
    inventory_id: number;
    inventory_name: string | null;
    type: string;
    quantity: number;
    adjustment_type: string | null;
    notes: string | null;
    created_at: string;
  }>;
}

export interface InventoryMovementResponse {
  success: boolean;
  message: string;
  data: InventoryMovementSummary;
}

export interface InventoryMovementParams {
  date_from?: string;
  date_to?: string;
  [key: string]: string | number | boolean | null | undefined;
}