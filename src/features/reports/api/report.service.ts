import type { ListParams } from "@/types";
import { api } from "@/lib/api";
import { REPORTS } from "@/lib/api";

export interface GradesSummary {
  total?: number;
  average?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface StudentsSummary {
  total?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface TeachersSummary {
  total?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface FinanceSummary {
  total_income?: number;
  total_expense?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface AttendanceDaily {
  date?: string;
  present?: number;
  absent?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface AttendanceStudentSummary {
  total?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface InventoryStockSummary {
  total_items?: number;
  low_stock?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface InventoryMovementSummary {
  total_in?: number;
  total_out?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface ReportParams extends ListParams {
  status?: string;
  start_date?: string;
  end_date?: string;
  academic_year_id?: number;
  semester_id?: number;
  class_id?: number;
  subject_id?: number;
  student_id?: number;
  teacher_id?: number;
}

export const reportService = {
  async academicGradesSummary(
    params?: ReportParams,
  ): Promise<GradesSummary> {
    return api.get<GradesSummary>(REPORTS.ACADEMIC_GRADES_SUMMARY, params);
  },

  async studentSummary(params?: ReportParams): Promise<StudentsSummary> {
    return api.get<StudentsSummary>(REPORTS.STUDENT_SUMMARY, params);
  },

  async teacherSummary(params?: ReportParams): Promise<TeachersSummary> {
    return api.get<TeachersSummary>(REPORTS.TEACHER_SUMMARY, params);
  },

  async teacherAttendanceSummary(params?: ReportParams): Promise<TeachersSummary> {
    return api.get<TeachersSummary>(REPORTS.TEACHER_ATTENDANCE_SUMMARY, params);
  },

  async financeSummary(params?: ReportParams): Promise<FinanceSummary> {
    return api.get<FinanceSummary>(REPORTS.FINANCE_SUMMARY, params);
  },

  async attendanceDaily(params?: ReportParams): Promise<AttendanceDaily> {
    return api.get<AttendanceDaily>(REPORTS.ATTENDANCE_DAILY, params);
  },

  async attendanceStudentSummary(
    params?: ReportParams,
  ): Promise<AttendanceStudentSummary> {
    return api.get<AttendanceStudentSummary>(REPORTS.ATTENDANCE_STUDENT_SUMMARY, params);
  },

  async inventoryStockSummary(
    params?: ReportParams,
  ): Promise<InventoryStockSummary> {
    return api.get<InventoryStockSummary>(REPORTS.INVENTORY_STOCK_SUMMARY, params);
  },

  async inventoryMovementSummary(
    params?: ReportParams,
  ): Promise<InventoryMovementSummary> {
    return api.get<InventoryMovementSummary>(
      REPORTS.INVENTORY_MOVEMENT_SUMMARY,
      params,
    );
  },
};
