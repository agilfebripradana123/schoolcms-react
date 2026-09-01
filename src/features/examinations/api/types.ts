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

export interface Exam {
  id: number;
  subject_id: number;
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
  options?: QuestionOptionPayload[];
}

export interface UpdateQuestionPayload extends Partial<CreateQuestionPayload> {}

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
  participant?: ExamParticipant;
  total_score: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  grade?: string | null;
  status: ExamResultStatus;
  graded_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExamResultPayload {
  participant_id: number;
  total_score?: number;
  correct_count?: number;
  wrong_count?: number;
  unanswered_count?: number;
  grade?: string | null;
  status: ExamResultStatus;
  graded_at?: string | null;
}

export interface UpdateExamResultPayload extends Partial<CreateExamResultPayload> {}

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
