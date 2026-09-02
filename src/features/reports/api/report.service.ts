import { api } from "@/lib/api";
import { REPORTS } from "@/lib/api";
import type {
  AcademicGradesSummaryParams,
  AcademicGradesSummaryResponse,
  AttendanceDailyParams,
  AttendanceDailyResponse,
  AttendanceStudentSummaryParams,
  AttendanceStudentSummaryResponse,
  FinanceReportResponse,
  FinanceSummaryParams,
  InventoryMovementParams,
  InventoryMovementResponse,
  InventoryStockResponse,
  StudentReportResponse,
  TeacherAttendanceSummaryParams,
  TeacherAttendanceSummaryResponse,
  TeacherReportResponse,
} from "./types";

export const reportService = {
  async academicGradesSummary(
    params?: AcademicGradesSummaryParams,
  ): Promise<AcademicGradesSummaryResponse> {
    return api.get<AcademicGradesSummaryResponse>(
      REPORTS.ACADEMIC_GRADES_SUMMARY,
      params,
    );
  },

  async studentSummary(): Promise<StudentReportResponse> {
    return api.get<StudentReportResponse>(REPORTS.STUDENT_SUMMARY);
  },

  async teacherSummary(): Promise<TeacherReportResponse> {
    return api.get<TeacherReportResponse>(REPORTS.TEACHER_SUMMARY);
  },

  async teacherAttendanceSummary(
    params?: TeacherAttendanceSummaryParams,
  ): Promise<TeacherAttendanceSummaryResponse> {
    return api.get<TeacherAttendanceSummaryResponse>(
      REPORTS.TEACHER_ATTENDANCE_SUMMARY,
      params,
    );
  },

  async financeSummary(
    params?: FinanceSummaryParams,
  ): Promise<FinanceReportResponse> {
    return api.get<FinanceReportResponse>(REPORTS.FINANCE_SUMMARY, params);
  },

  async attendanceDaily(
    params: AttendanceDailyParams,
  ): Promise<AttendanceDailyResponse> {
    return api.get<AttendanceDailyResponse>(REPORTS.ATTENDANCE_DAILY, params);
  },

  async attendanceStudentSummary(
    params?: AttendanceStudentSummaryParams,
  ): Promise<AttendanceStudentSummaryResponse> {
    return api.get<AttendanceStudentSummaryResponse>(
      REPORTS.ATTENDANCE_STUDENT_SUMMARY,
      params,
    );
  },

  async inventoryStockSummary(): Promise<InventoryStockResponse> {
    return api.get<InventoryStockResponse>(REPORTS.INVENTORY_STOCK_SUMMARY);
  },

  async inventoryMovementSummary(
    params?: InventoryMovementParams,
  ): Promise<InventoryMovementResponse> {
    return api.get<InventoryMovementResponse>(
      REPORTS.INVENTORY_MOVEMENT_SUMMARY,
      params,
    );
  },
};