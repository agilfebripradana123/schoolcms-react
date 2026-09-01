import type { ListParams } from "@/types";

// Local types — API returns supervisor as Teacher object, not string
export interface Teacher {
  id: number;
  full_name: string;
  prefix_title?: string | null;
  suffix_title?: string | null;
}

export function formatSupervisor(s: string | Teacher | null | undefined): string {
  if (!s) return "-";
  if (typeof s === "string") return s;
  return [s.prefix_title, s.full_name, s.suffix_title].filter(Boolean).join(" ") || "-";
}

// Re-export achievement types from dev (they match API shape)
export type {
  Achievement,
  CreateAchievementPayload,
  UpdateAchievementPayload,
} from "@/features/development/api/types";

// Local Violation — matches Kesiswaan DB schema (category, points, violated_at, handled_by)
export interface Violation {
  id: number;
  student_id: number;
  category: string;
  description?: string | null;
  points: number;
  violated_at: string;
  handled_by?: number | string | null;
  student?: Student;
  created_at?: string;
  updated_at?: string;
}

export interface CreateViolationPayload {
  student_id: number;
  category: string;
  description?: string | null;
  points: number;
  violated_at: string;
  handled_by?: number | string | null;
}

export interface UpdateViolationPayload extends Partial<CreateViolationPayload> {}

// Local Extracurricular — supervisor can be string or Teacher object from API
export interface Extracurricular {
  id: number;
  name?: string;
  description?: string | null;
  supervisor?: string | Teacher | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExtracurricularPayload {
  name?: string;
  description?: string;
  supervisor?: string;
}

export interface UpdateExtracurricularPayload extends Partial<CreateExtracurricularPayload> {}

export type CounselingStatus = "terjadwal" | "selesai" | "dibatalkan";

export interface Student {
  id: number;
  name: string;
  nisn?: string;
}

export interface Counseling {
  id: number;
  student_id: number;
  counselor_id: number;
  counseling_date: string;
  topic: string;
  notes?: string | null;
  follow_up?: string | null;
  status: CounselingStatus;
  student?: Student;
  counselor?: Teacher;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCounselingPayload {
  student_id: number;
  counselor_id: number;
  counseling_date: string;
  topic: string;
  notes?: string | null;
  follow_up?: string | null;
  status?: CounselingStatus;
}

export interface UpdateCounselingPayload extends Partial<CreateCounselingPayload> {}

export interface CounselingListParams extends ListParams {
  student_id?: number;
  counselor_id?: number;
  status?: CounselingStatus;
  date_from?: string;
  date_to?: string;
}
