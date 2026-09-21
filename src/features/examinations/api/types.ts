import type { ListParams } from "@/types";

// ---------------------------------------------------------------------
// Pagination / API envelope
// Backend paginated list responses return:
//   { success, message, data: [...], meta: { current_page, per_page, total, last_page } }
// ---------------------------------------------------------------------
export interface ExaminationListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ExaminationPaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: ExaminationListMeta;
}

// ---------------------------------------------------------------------
// Referenced / nested resource shapes
// (returned by JsonResources only when the relationship is loaded)
// ---------------------------------------------------------------------
export interface SubjectRef {
  id: number;
  code?: string;
  name?: string;
  type?: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RoomRef {
  id: number;
  code?: string;
  name?: string;
  capacity?: number | null;
  location?: string | null;
  has_computer?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentRef {
  id: number;
  user_id?: number | null;
  class_id?: number | null;
  nisn?: string;
  nis?: string;
  name: string;
  gender?: "L" | "P";
  birth_place?: string;
  birth_date?: string;
  address?: string;
  phone?: string | null;
  photo?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ---------------------------------------------------------------------
// Exam
// ---------------------------------------------------------------------
export type ExamStatus = "draft" | "published" | "ongoing" | "completed" | "archived";
export type ExamType =
  | "formatif"
  | "sumatif"
  | "uts"
  | "uas"
  | "ujian_sekolah"
  | "remedial"
  | "other";

export interface Exam {
  id: number;
  subject_id: number;
  class_id?: number | null;
  academic_year_id?: number | null;
  semester_id?: number | null;
  teacher_id?: number | null;
  exam_type?: ExamType | null;
  title: string;
  description?: string | null;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  max_attempts: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_result: boolean;
  status: ExamStatus;
  subject?: SubjectRef;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CreateExamPayload {
  subject_id: number;
  class_id?: number | null;
  academic_year_id?: number | null;
  semester_id?: number | null;
  exam_type?: ExamType | null;
  title: string;
  description?: string | null;
  duration_minutes: number;
  total_questions?: number;
  passing_score?: number;
  max_attempts?: number;
  shuffle_questions?: boolean;
  shuffle_options?: boolean;
  show_result?: boolean;
  status?: ExamStatus;
}

export interface UpdateExamPayload extends Partial<CreateExamPayload> {}

// ---------------------------------------------------------------------
// Exam composition (exam_questions)
// ---------------------------------------------------------------------
export type QuestionStatus = "draft" | "approved" | "archived";

export interface ExamQuestionRef {
  id: number;
  code?: string | null;
  question_text: string;
  type: QuestionType;
  difficulty?: QuestionDifficulty | null;
  points?: number;
  status?: QuestionStatus | null;
}

export interface ExamQuestion {
  id: number;
  exam_id: number;
  question_id: number;
  blueprint_item_id?: number | null;
  position: number;
  points: number;
  question?: ExamQuestionRef | null;
  created_at?: string;
  updated_at?: string;
}

export interface AddExamQuestionPayload {
  question_id: number;
  position?: number;
  points?: number;
}

export interface UpdateExamQuestionPayload {
  position?: number;
  points?: number;
}

// ---------------------------------------------------------------------
// Teacher essay grading (exam-grading)
// ---------------------------------------------------------------------
export interface TeacherEssayStudent {
  id: number;
  name: string | null;
  nis: string | null;
}

export interface TeacherEssayItem {
  exam_answer_id: number;
  attempt_question_id: number;
  question_text: string;
  max_points: number;
  student: TeacherEssayStudent;
  essay_answer: string | null;
  score: number | null;
  grade_status: string | null;
  feedback: string | null;
  graded_at: string | null;
}

export interface TeacherEssayGradingData {
  attempt_id: number;
  attempt_status: string;
  essays: TeacherEssayItem[];
}

export interface GradeEssayPayload {
  score: number;
  feedback?: string | null;
}

export interface GradeResultSummary {
  total_score: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  grade: string | null;
  percentage: number;
  status: string;
}

export interface GradeEssayResponse {
  attempt_question_id: number;
  score: number;
  feedback: string | null;
  grade_status: string;
  graded_by: number;
  graded_at: string | null;
  result: GradeResultSummary;
}

export interface GradeSyncResultData {
  grade_id: number;
  grade?: unknown;
}

// ---------------------------------------------------------------------
// QuestionBank
// ---------------------------------------------------------------------
export type QuestionType = "multiple_choice" | "true_false" | "essay";
export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface QuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  option_image?: string | null;
  is_correct: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface QuestionOptionPayload {
  option_text: string;
  option_image?: string | null;
  is_correct: boolean;
}

export interface QuestionBank {
  id: number;
  subject_id: number;
  instruction_id?: number | null;
  question_text: string;
  question_image?: string | null;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  explanation?: string | null;
  points: number;
  status?: QuestionStatus | null;
  subject?: SubjectRef;
  options?: QuestionOption[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateQuestionPayload {
  subject_id: number;
  instruction_id?: number | null;
  question_text: string;
  question_image?: string | null;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  explanation?: string | null;
  points: number;
  status?: QuestionStatus | null;
  options?: QuestionOptionPayload[];
}

export interface UpdateQuestionPayload extends Partial<CreateQuestionPayload> {}

// ---------------------------------------------------------------------
// Question Bank XLSX import (EXAM-IMPORT-01)
// Backend contract: preview row only exposes excel_row, question_text,
// question_type, points and option_count — no option text / answer / explanation.
// ---------------------------------------------------------------------
export interface QuestionImportError {
  row: number;
  field: string;
  message: string;
}

export interface QuestionImportPreviewRow {
  excel_row: number;
  question_text: string;
  question_type: string;
  points: number;
  option_count: number;
}

export interface QuestionImportPreviewData {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  errors: QuestionImportError[];
  preview: QuestionImportPreviewRow[];
}

export interface QuestionImportResultData {
  imported_count: number;
  question_ids: number[];
}

// ---------------------------------------------------------------------
// ExamInstruction
// ---------------------------------------------------------------------
export interface ExamInstruction {
  id: number;
  title: string;
  content: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExamInstructionPayload {
  title: string;
  content: string;
  is_active?: boolean;
}

export interface UpdateExamInstructionPayload
  extends Partial<CreateExamInstructionPayload> {}

// ---------------------------------------------------------------------
// ExamSession
// ---------------------------------------------------------------------
export interface ExamSession {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExamSessionPayload {
  name: string;
  start_time: string;
  end_time: string;
}

export interface UpdateExamSessionPayload extends Partial<CreateExamSessionPayload> {}

// ---------------------------------------------------------------------
// ExamSchedule
// ---------------------------------------------------------------------
export interface ExamSchedule {
  id: number;
  exam_id: number;
  room_id: number;
  session_id: number;
  exam_date: string;
  exam?: Exam;
  room?: RoomRef;
  session?: ExamSession;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExamSchedulePayload {
  exam_id: number;
  room_id: number;
  session_id: number;
  exam_date: string;
}

export interface UpdateExamSchedulePayload extends Partial<CreateExamSchedulePayload> {}

// ---------------------------------------------------------------------
// ExamParticipant
// ---------------------------------------------------------------------
export type ExamParticipantStatus = "registered" | "started" | "completed" | "blocked";

export interface ExamParticipant {
  id: number;
  exam_id: number;
  student_id: number;
  exam_card_number: string;
  status: ExamParticipantStatus;
  started_at?: string | null;
  completed_at?: string | null;
  is_blocked: boolean;
  blocked_reason?: string | null;
  login_allowed: boolean;
  current_session_id?: number | null;
  last_activity_at?: string | null;
  ip_address?: string | null;
  exam?: Exam;
  student?: StudentRef;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExamParticipantPayload {
  exam_id: number;
  student_id: number;
  exam_card_number: string;
  status: ExamParticipantStatus;
  started_at?: string | null;
  completed_at?: string | null;
  is_blocked?: boolean;
  blocked_reason?: string | null;
  login_allowed?: boolean;
  current_session_id?: number | null;
  last_activity_at?: string | null;
  ip_address?: string | null;
}

export interface UpdateExamParticipantPayload
  extends Partial<CreateExamParticipantPayload> {}

// ---------------------------------------------------------------------
// ExamAnswer
// ---------------------------------------------------------------------
export interface ExamAnswer {
  id: number;
  participant_id: number;
  question_id: number;
  question?: QuestionBank;
  selected_option_id?: number | null;
  selected_option?: QuestionOption;
  essay_answer?: string | null;
  is_correct?: boolean | null;
  answered_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExamAnswerPayload {
  participant_id: number;
  question_id: number;
  selected_option_id?: number | null;
  essay_answer?: string | null;
  is_correct?: boolean | null;
  answered_at: string;
}

export interface UpdateExamAnswerPayload extends Partial<CreateExamAnswerPayload> {}

// ---------------------------------------------------------------------
// ExamResult
// ---------------------------------------------------------------------
export type ExamResultStatus = "pending" | "graded";

export interface ExamResult {
  id: number;
  participant_id: number;
  exam_attempt_id?: number | null;
  attempt_number?: number | null;
  participant?: ExamParticipant;
  total_score: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  grade?: string | null;
  status: ExamResultStatus;
  is_final?: boolean;
  finalized_at?: string | null;
  is_effective?: boolean;
  grade_synced?: boolean;
  grade_stale?: boolean;
  graded_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExamResultPayload {
  exam_attempt_id: number;
}

export interface UpdateExamResultPayload extends Partial<CreateExamResultPayload> {}

// ---------------------------------------------------------------------
// Admin attempt options (exam-attempts selector for result creation)
// ---------------------------------------------------------------------
export interface ExamAttemptOptionSubject {
  id: number;
  name: string;
}

export interface ExamAttemptOptionExam {
  id: number;
  title: string;
  subject: ExamAttemptOptionSubject | null;
}

export interface ExamAttemptOptionStudent {
  id: number;
  name: string;
  nis: string;
}

export interface ExamAttemptOptionParticipant {
  id: number;
  exam_card_number: string;
  student: ExamAttemptOptionStudent | null;
}

export interface ExamAttemptOption {
  id: number;
  attempt_number: number;
  status: string;
  started_at: string | null;
  submitted_at: string | null;
  expires_at: string | null;
  has_result: boolean;
  exam: ExamAttemptOptionExam | null;
  participant: ExamAttemptOptionParticipant | null;
}

// ---------------------------------------------------------------------
// Exam reports (B15)
// ---------------------------------------------------------------------
export interface ExamReportExamInfo {
  id: number;
  title: string;
  subject_id: number;
  subject_name: string | null;
  status: string;
}

export interface ExamReportSummary {
  participant_count: number;
  attempt_count: number;
  submitted_attempt_count: number;
  effective_attempt_count: number;
  incomplete_attempt_count: number;
  average_percentage: number | null;
  minimum_percentage: number | null;
  maximum_percentage: number | null;
}

export interface ExamReportData {
  exam: ExamReportExamInfo;
  summary: ExamReportSummary;
}

export interface ExamOptionDistribution {
  option_id: number;
  option_text: string;
  position: number;
  selected_count: number;
}

export interface ExamEssayAggregate {
  pending_manual: number;
  manually_graded: number;
  average_score: number | null;
}

export interface ExamReportQuestion {
  question_id: number;
  source_question_id: number | null;
  position: number;
  question_text: string;
  type: QuestionType | string;
  points: number;
  attempts_total: number;
  answered: number;
  unanswered: number;
  correct: number | null;
  incorrect: number | null;
  correctness_percentage: number | null;
  option_distribution: ExamOptionDistribution[];
  essay: ExamEssayAggregate | null;
}

export interface ExamQuestionReport {
  exam_id: number;
  questions: ExamReportQuestion[];
}

// ---------------------------------------------------------------------
// List params
// Backend filterable fields (per controller index methods)
// ---------------------------------------------------------------------
export interface ExaminationListParams extends ListParams {
  subject_id?: number;
  instruction_id?: number;
  exam_id?: number;
  student_id?: number;
  room_id?: number;
  session_id?: number;
  participant_id?: number;
  question_id?: number;
  exam_date?: string;
  type?: QuestionType;
  difficulty?: QuestionDifficulty;
  status?: string;
}
