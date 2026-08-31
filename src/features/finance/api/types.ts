import type { ListParams } from "@/types";
import type { Student } from "@/features/students/api/types";
import type { User } from "@/types";
import type { AcademicYear, Semester } from "@/features/academic/api/types";

export type { Student } from "@/features/students/api/types";
export type { User } from "@/types";
export type { AcademicYear, Semester } from "@/features/academic/api/types";

// ---- Fee Type ----
export interface FeeType {
  id: number;
  name: string;
  amount: number;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFeeTypePayload {
  name: string;
  amount: number;
  description?: string;
  is_active?: boolean;
}

export interface UpdateFeeTypePayload extends Partial<CreateFeeTypePayload> {}

// ---- Billing ----
export type BillingStatus = "unpaid" | "partial" | "paid" | "cancelled";

export interface Billing {
  id: number;
  student_id: number;
  fee_type_id: number;
  academic_year_id: number;
  semester_id?: number | null;
  amount: number;
  due_date?: string;
  status: BillingStatus;
  notes?: string | null;
  paid?: number;
  outstanding?: number;
  payments?: Payment[];
  student?: Student;
  fee_type?: FeeType;
  academic_year?: AcademicYear;
  semester?: Semester;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBillingPayload {
  student_id: number;
  fee_type_id: number;
  academic_year_id: number;
  semester_id?: number | null;
  amount: number;
  due_date?: string;
  notes?: string;
}

export interface UpdateBillingPayload extends Partial<CreateBillingPayload> {}

// ---- Payment ----
export type PaymentMethod = "cash" | "transfer" | "qris" | "lainnya";

export interface Payment {
  id: number;
  billing_id: number;
  student_id: number;
  payment_date: string;
  amount: number;
  method: PaymentMethod;
  reference_number?: string | null;
  received_by?: number | null;
  notes?: string | null;
  billing?: Billing;
  student?: Student;
  cashier?: User;
  transactions?: PaymentTransaction[];
  created_at?: string;
  updated_at?: string;
}

export interface CreatePaymentPayload {
  billing_id: number;
  student_id: number;
  payment_date: string;
  amount: number;
  method: PaymentMethod;
  reference_number?: string;
  received_by?: number | null;
  notes?: string;
}

export interface UpdatePaymentPayload extends Partial<CreatePaymentPayload> {}

// ---- Payment Transaction ----
export type TransactionType = "payment" | "refund" | "adjustment";
export type TransactionStatus = "success" | "pending" | "failed";

export interface PaymentTransaction {
  id: number;
  payment_id: number;
  transaction_code: string;
  type: TransactionType;
  amount: number;
  method: PaymentMethod;
  status: TransactionStatus;
  transaction_date: string;
  payment?: Payment;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePaymentTransactionPayload {
  payment_id: number;
  transaction_code: string;
  type: TransactionType;
  amount: number;
  method: PaymentMethod;
  status?: TransactionStatus;
  transaction_date: string;
}

export interface UpdatePaymentTransactionPayload
  extends Partial<CreatePaymentTransactionPayload> {}

// ---- Scholarship ----
export type ScholarshipStatus = "aktif" | "selesai" | "dibatalkan";

export interface Scholarship {
  id: number;
  student_id: number;
  name: string;
  provider?: string | null;
  amount?: number | null;
  start_date?: string;
  end_date?: string;
  status: ScholarshipStatus;
  student?: Student;
  created_at?: string;
  updated_at?: string;
}

export interface CreateScholarshipPayload {
  student_id: number;
  name: string;
  provider?: string;
  amount?: number;
  start_date?: string;
  end_date?: string;
  status: ScholarshipStatus;
}

export interface UpdateScholarshipPayload
  extends Partial<CreateScholarshipPayload> {}

// ---- Financial Report ----
export type FinancialReportType =
  | "harian"
  | "bulanan"
  | "semester"
  | "tahunan"
  | "custom";

export interface FinancialReport {
  id: number;
  title: string;
  report_type: FinancialReportType;
  period_start: string;
  period_end: string;
  total_billed?: number | null;
  total_paid?: number | null;
  total_outstanding?: number | null;
  generated_by?: number | null;
  source_fingerprint?: string | null;
  notes?: string | null;
  generator?: User;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFinancialReportPayload {
  title: string;
  report_type: FinancialReportType;
  period_start: string;
  period_end: string;
  notes?: string;
}

export interface UpdateFinancialReportPayload
  extends Partial<CreateFinancialReportPayload> {}

export interface FinanceListParams extends ListParams {
  status?: string;
  student_id?: number;
  fee_type_id?: number;
  type?: string;
  report_type?: string;
}