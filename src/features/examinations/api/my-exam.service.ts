import { api } from "@/lib/api";
import { TEACHER } from "@/lib/api/endpoints";
import type { ApiEnvelope, ListParams } from "@/types";
import type {
  Exam,
  ExamResult,
  ExamSchedule,
  ExaminationListMeta,
} from "./types";

interface TeacherExamListResponse {
  success: boolean;
  message: string;
  data: Exam[];
  meta: ExaminationListMeta;
}

interface TeacherExamScheduleListResponse {
  success: boolean;
  message: string;
  data: ExamSchedule[];
  meta: ExaminationListMeta;
}

interface TeacherExamResultListResponse {
  success: boolean;
  message: string;
  data: ExamResult[];
  meta: ExaminationListMeta;
}

interface TeacherExamListParams extends ListParams {
  search?: string;
  subject_id?: number;
  status?: string;
}

interface TeacherExamScheduleListParams extends ListParams {
  exam_id?: number;
  room_id?: number;
  session_id?: number;
  exam_date?: string;
}

interface TeacherExamResultListParams extends ListParams {
  participant_id?: number;
  status?: string;
}

/**
 * Teacher self-service: Ujian (Portal Guru).
 * Endpoint `/api/teacher/exams*` — semua scope (mata pelajaran mengajar guru)
 * ditentukan backend dari user login + TeacherAssignment; client tidak mengirim
 * teacher_id sebagai boundary keamanan.
 */
export const myExamService = {
  async list(params?: TeacherExamListParams): Promise<TeacherExamListResponse> {
    return api.get<TeacherExamListResponse>(TEACHER.EXAMS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Exam>> {
    return api.get<ApiEnvelope<Exam>>(`${TEACHER.EXAMS}/${id}`);
  },
};

export const myExamScheduleService = {
  async list(
    params?: TeacherExamScheduleListParams,
  ): Promise<TeacherExamScheduleListResponse> {
    return api.get<TeacherExamScheduleListResponse>(TEACHER.EXAM_SCHEDULES, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<ExamSchedule>> {
    return api.get<ApiEnvelope<ExamSchedule>>(`${TEACHER.EXAM_SCHEDULES}/${id}`);
  },
};

export const myExamResultService = {
  async list(
    params?: TeacherExamResultListParams,
  ): Promise<TeacherExamResultListResponse> {
    return api.get<TeacherExamResultListResponse>(TEACHER.EXAM_RESULTS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<ExamResult>> {
    return api.get<ApiEnvelope<ExamResult>>(`${TEACHER.EXAM_RESULTS}/${id}`);
  },
};
