import type { ListParams } from "@/types";

export interface Achievement {
  id: number;
  student_id?: number;
  title?: string;
  description?: string | null;
  achievement_date?: string;
  level?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAchievementPayload {
  student_id?: number;
  title?: string;
  description?: string;
  achievement_date?: string;
  level?: string;
}

export interface UpdateAchievementPayload extends Partial<CreateAchievementPayload> {}

export interface Violation {
  id: number;
  student_id?: number;
  title?: string;
  description?: string | null;
  violation_date?: string;
  severity?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateViolationPayload {
  student_id?: number;
  title?: string;
  description?: string;
  violation_date?: string;
  severity?: string;
}

export interface UpdateViolationPayload extends Partial<CreateViolationPayload> {}

export interface Counseling {
  id: number;
  student_id?: number;
  title?: string;
  description?: string | null;
  counselor?: string;
  counseling_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCounselingPayload {
  student_id?: number;
  title?: string;
  description?: string;
  counselor?: string;
  counseling_date?: string;
}

export interface UpdateCounselingPayload extends Partial<CreateCounselingPayload> {}

export interface Extracurricular {
  id: number;
  name?: string;
  description?: string | null;
  supervisor?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExtracurricularPayload {
  name?: string;
  description?: string;
  supervisor?: string;
}

export interface UpdateExtracurricularPayload
  extends Partial<CreateExtracurricularPayload> {}

export interface DevelopmentListParams extends ListParams {
  student_id?: number;
  status?: string;
}
