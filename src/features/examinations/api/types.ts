import type { ListParams } from "@/types";

export interface Exam {
  id: number;
  title: string;
  description?: string | null;
  subject_id?: number;
  class_id?: number;
  starts_at?: string;
  ends_at?: string;
  duration?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExamPayload {
  title: string;
  description?: string;
  subject_id?: number;
  class_id?: number;
  starts_at?: string;
  ends_at?: string;
  duration?: number;
}

export interface UpdateExamPayload extends Partial<CreateExamPayload> {}

export interface QuestionBank {
  id: number;
  subject_id?: number;
  question?: string;
  type?: string;
  options?: QuestionOption[] | null;
  answer?: string;
  created_at?: string;
  updated_at?: string;
}

export interface QuestionOption {
  id?: number;
  text?: string;
  is_correct?: boolean;
}

export interface CreateQuestionPayload {
  subject_id?: number;
  question?: string;
  type?: string;
  options?: QuestionOption[];
  answer?: string;
}

export interface UpdateQuestionPayload extends Partial<CreateQuestionPayload> {}

export interface ExamSession {
  id: number;
  exam_id?: number;
  name?: string;
  starts_at?: string;
  ends_at?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExamSessionPayload {
  exam_id?: number;
  name?: string;
  starts_at?: string;
  ends_at?: string;
  status?: string;
}

export interface UpdateExamSessionPayload extends Partial<CreateExamSessionPayload> {}

export interface ExamSchedule {
  id: number;
  exam_id?: number;
  start_time?: string;
  end_time?: string;
  location?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExamSchedulePayload {
  exam_id?: number;
  start_time?: string;
  end_time?: string;
  location?: string;
}

export interface UpdateExamSchedulePayload extends Partial<CreateExamSchedulePayload> {}

export interface ExamInstruction {
  id: number;
  exam_id?: number;
  instruction?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExamInstructionPayload {
  exam_id?: number;
  instruction?: string;
  order?: number;
}

export interface UpdateExamInstructionPayload
  extends Partial<CreateExamInstructionPayload> {}

export interface ExamParticipant {
  id: number;
  exam_id?: number;
  student_id?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExamParticipantPayload {
  exam_id?: number;
  student_id?: number;
  status?: string;
}

export interface UpdateExamParticipantPayload
  extends Partial<CreateExamParticipantPayload> {}

export interface ExamResult {
  id: number;
  exam_id?: number;
  student_id?: number;
  score?: number;
  grade?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExamResultPayload {
  exam_id?: number;
  student_id?: number;
  score?: number;
  grade?: string;
}

export interface UpdateExamResultPayload extends Partial<CreateExamResultPayload> {}

export interface ExamAnswer {
  id: number;
  exam_result_id?: number;
  question_id?: number;
  answer?: string;
  is_correct?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExamAnswerPayload {
  exam_result_id?: number;
  question_id?: number;
  answer?: string;
  is_correct?: boolean;
}

export interface UpdateExamAnswerPayload extends Partial<CreateExamAnswerPayload> {}

export interface ExaminationListParams extends ListParams {
  subject_id?: number;
  class_id?: number;
  exam_id?: number;
  student_id?: number;
  status?: string;
}
