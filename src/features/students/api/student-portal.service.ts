import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";

// ---- Types ----
export interface StudentGrade {
  id: number;
  subject_id: number;
  subject_name: string;
  tugas: number | null;
  uts: number | null;
  uas: number | null;
  final_score: number | null;
  semester: string;
  academic_year: string;
}

export interface StudentGradeSummary {
  average: number;
  highest: number;
  total_subjects: number;
}

export interface StudentSchedule {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  subject_name: string;
  teacher_name: string | null;
  room_name: string | null;
}

export interface StudentAttendanceSummary {
  total_days: number;
  present: number;
  sick: number;
  permission: number;
  absent: number;
  percentage: number;
}

export interface StudentAttendance {
  id: number;
  date: string;
  status: "hadir" | "sakit" | "izin" | "alpa";
  note: string | null;
  class_name: string;
}

// ---- Service ----
export const studentPortalService = {
  async getGrades(params?: {
    semester_id?: number;
    academic_year_id?: number;
  }): Promise<{ success: boolean; data: StudentGrade[] }> {
    return api.get(STUDENTS.GRADES, params);
  },

  async getGradeSummary(params?: {
    semester_id?: number;
    academic_year_id?: number;
  }): Promise<{ success: boolean; data: StudentGradeSummary }> {
    return api.get(`${STUDENTS.GRADES}/summary`, params);
  },

  async getSchedules(params?: {
    day?: string;
    semester_id?: number;
  }): Promise<{ success: boolean; data: StudentSchedule[] }> {
    return api.get(STUDENTS.SCHEDULES, params);
  },

  async getAttendanceSummary(params?: {
    semester_id?: number;
    academic_year_id?: number;
  }): Promise<{ success: boolean; data: StudentAttendanceSummary }> {
    return api.get(`${STUDENTS.ATTENDANCE}/summary`, params);
  },

  async getAttendanceList(params?: {
    semester_id?: number;
    academic_year_id?: number;
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ success: boolean; data: StudentAttendance[] }> {
    return api.get(STUDENTS.ATTENDANCE, params);
  },
};
