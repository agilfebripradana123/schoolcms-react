import type { ListParams } from "@/types";

export interface FeeType {
  id: number;
  name: string;
  amount?: number;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFeeTypePayload {
  name: string;
  amount?: number;
  description?: string;
}

export interface UpdateFeeTypePayload extends Partial<CreateFeeTypePayload> {}

export interface Billing {
  id: number;
  student_id?: number;
  fee_type_id?: number;
  amount?: number;
  status?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBillingPayload {
  student_id?: number;
  fee_type_id?: number;
  amount?: number;
  status?: string;
  due_date?: string;
}

export interface UpdateBillingPayload extends Partial<CreateBillingPayload> {}

export interface Payment {
  id: number;
  billing_id?: number;
  amount?: number;
  payment_date?: string;
  method?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePaymentPayload {
  billing_id?: number;
  amount?: number;
  payment_date?: string;
  method?: string;
  status?: string;
}

export interface UpdatePaymentPayload extends Partial<CreatePaymentPayload> {}

export interface PaymentTransaction {
  id: number;
  payment_id?: number;
  reference?: string;
  amount?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePaymentTransactionPayload {
  payment_id?: number;
  reference?: string;
  amount?: number;
  status?: string;
}

export interface UpdatePaymentTransactionPayload
  extends Partial<CreatePaymentTransactionPayload> {}

export interface Scholarship {
  id: number;
  student_id?: number;
  name?: string;
  amount?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateScholarshipPayload {
  student_id?: number;
  name?: string;
  amount?: number;
  status?: string;
}

export interface UpdateScholarshipPayload extends Partial<CreateScholarshipPayload> {}

export interface FinancialReport {
  id: number;
  period?: string;
  total_income?: number;
  total_expense?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFinancialReportPayload {
  period?: string;
  total_income?: number;
  total_expense?: number;
}

export interface UpdateFinancialReportPayload
  extends Partial<CreateFinancialReportPayload> {}

export interface FinanceListParams extends ListParams {
  status?: string;
  student_id?: number;
  fee_type_id?: number;
}
