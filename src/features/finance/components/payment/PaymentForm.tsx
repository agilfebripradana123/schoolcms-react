import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { paymentService } from "../../api/payment.service";
import { billingService } from "../../api/billing.service";
import { studentService } from "@/features/students/api/student.service";
import { userManagementService } from "@/features/system/api/user.service";
import type { UserManagement } from "@/features/system/api/types";
import type {
  Billing,
  CreatePaymentPayload,
  Payment,
  PaymentMethod,
} from "../../api/types";
import type { Student } from "@/features/students/api/types";

interface PaymentFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Payment | null;
}

const METHOD_OPTIONS: Array<{ value: PaymentMethod; label: string }> = [
  { value: "cash", label: "Tunai" },
  { value: "transfer", label: "Transfer" },
  { value: "qris", label: "QRIS" },
  { value: "lainnya", label: "Lainnya" },
];

function billingLabel(b: Billing): string {
  const feeType = b.fee_type?.name ?? `#${b.fee_type_id}`;
  const student = b.student?.name ?? `#${b.student_id}`;
  const year = b.academic_year?.name ?? "";
  return year ? `${feeType} - ${student} (${year})` : `${feeType} - ${student}`;
}

export default function PaymentForm({
  open,
  onClose,
  onSaved,
  initialData,
}: PaymentFormProps) {
  const [billingId, setBillingId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [receivedBy, setReceivedBy] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [billings, setBillings] = useState<Billing[]>([]);
  const [billingsLoading, setBillingsLoading] = useState(false);
  const [billingsError, setBillingsError] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(false);

  const [cashiers, setCashiers] = useState<UserManagement[]>([]);
  const [cashiersLoading, setCashiersLoading] = useState(false);
  const [cashiersError, setCashiersError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadBillings = useCallback(() => {
    setBillingsLoading(true);
    setBillingsError(false);
    billingService
      .list({ per_page: 200 })
      .then((res) => {
        setBillings(res.data);
        setBillingsError(false);
      })
      .catch(() => {
        setBillingsError(true);
      })
      .finally(() => {
        setBillingsLoading(false);
      });
  }, []);

  const loadStudents = useCallback(() => {
    setStudentsLoading(true);
    setStudentsError(false);
    studentService
      .list({ per_page: 200 })
      .then((res) => {
        setStudents(res.data);
        setStudentsError(false);
      })
      .catch(() => {
        setStudentsError(true);
      })
      .finally(() => {
        setStudentsLoading(false);
      });
  }, []);

  const loadCashiers = useCallback(() => {
    setCashiersLoading(true);
    setCashiersError(false);
    userManagementService
      .list({ per_page: 100 })
      .then((res) => {
        setCashiers(res.data);
        setCashiersError(false);
      })
      .catch(() => {
        setCashiersError(true);
      })
      .finally(() => {
        setCashiersLoading(false);
      });
  }, []);

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});
      loadBillings();
      loadStudents();
      loadCashiers();

      if (initialData) {
        setBillingId(String(initialData.billing_id));
        setStudentId(String(initialData.student_id));
        setPaymentDate(initialData.payment_date ?? "");
        setAmount(initialData.amount != null ? String(initialData.amount) : "");
        setMethod(initialData.method);
        setReferenceNumber(initialData.reference_number ?? "");
        setReceivedBy(initialData.received_by != null ? String(initialData.received_by) : "");
        setNotes(initialData.notes ?? "");
      } else {
        setBillingId("");
        setStudentId("");
        setPaymentDate("");
        setAmount("");
        setMethod("cash");
        setReferenceNumber("");
        setReceivedBy("");
        setNotes("");
      }
    }
  }, [open, initialData, loadBillings, loadStudents, loadCashiers]);

  const handleBillingChange = useCallback((value: string) => {
    setBillingId(value);
    const billing = billings.find((b) => String(b.id) === value);
    if (billing) {
      if (billing.student_id != null) setStudentId(String(billing.student_id));
      if (billing.amount != null) setAmount(String(billing.amount));
    }
  }, [billings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const amountNum = Number(amount);
    if (!amount || Number.isNaN(amountNum)) {
      setError({ message: "Jumlah pembayaran wajib diisi dengan angka." });
      setSubmitting(false);
      return;
    }
    if (amountNum < 0) {
      setError({ message: "Jumlah pembayaran tidak boleh kurang dari 0." });
      setSubmitting(false);
      return;
    }

    const payload: CreatePaymentPayload = {
      billing_id: Number(billingId),
      student_id: Number(studentId),
      payment_date: paymentDate,
      amount: amountNum,
      method,
      reference_number: referenceNumber.trim() || undefined,
      received_by: receivedBy ? Number(receivedBy) : null,
      notes: notes.trim() || undefined,
    };

    try {
      if (initialData) {
        await paymentService.update(initialData.id, payload);
        toast.success("Pembayaran berhasil diperbarui.");
      } else {
        await paymentService.create(payload);
        toast.success("Pembayaran berhasil dicatat.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan pembayaran", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const billingOptions = billings.map((b) => ({ value: String(b.id), label: billingLabel(b) }));
  const studentOptions = students.map((s) => ({ value: String(s.id), label: s.name }));
  const cashierOptions = cashiers.map((u) => ({ value: String(u.id), label: u.name }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Pembayaran" : "Catat Pembayaran"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="payment-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="payment-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Tagihan" required error={fieldErrors.billing_id?.[0]}>
            {billingsLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat tagihan...
              </div>
            ) : billingsError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data tagihan.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadBillings}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : billings.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada tagihan tersedia. Buat penagihan terlebih dahulu.
              </p>
            ) : (
              <AppSelect
                value={billingId}
                onChange={(v) => handleBillingChange(v ?? "")}
                options={billingOptions}
                placeholder="Pilih Tagihan"
                isDisabled={submitting}
              />
            )}
          </FormField>

          <FormField label="Siswa" required error={fieldErrors.student_id?.[0]}>
            {studentsLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat siswa...
              </div>
            ) : studentsError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data siswa.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadStudents}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : students.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada siswa tersedia.
              </p>
            ) : (
              <AppSelect
                value={studentId}
                onChange={(v) => setStudentId(v ?? "")}
                options={studentOptions}
                placeholder="Pilih Siswa"
                isDisabled={submitting}
              />
            )}
          </FormField>

          <FormField label="Tanggal Bayar" required error={fieldErrors.payment_date?.[0]}>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Jumlah"
            required
            hint="Nominal rupiah."
            error={fieldErrors.amount?.[0]}
          >
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="250000"
              disabled={submitting}
            />
          </FormField>

          <FormField label="Metode" required error={fieldErrors.method?.[0]}>
            <AppSelect
              value={method}
              onChange={(v) => setMethod((v ?? "cash") as PaymentMethod)}
              options={METHOD_OPTIONS}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>

          <FormField
            label="Nomor Referensi"
            hint="Opsional."
            error={fieldErrors.reference_number?.[0]}
          >
            <Input
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Contoh: TRF-2026-0001"
              maxLength={50}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Diterima Oleh" hint="Opsional." error={fieldErrors.received_by?.[0]}>
            {cashiersLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat pengguna...
              </div>
            ) : cashiersError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data pengguna.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadCashiers}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : cashiers.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada pengguna tersedia.
              </p>
            ) : (
              <AppSelect
                value={receivedBy}
                onChange={(v) => setReceivedBy(v ?? "")}
                options={cashierOptions}
                placeholder="Pilih Pengguna"
                isClearable
                isDisabled={submitting}
              />
            )}
          </FormField>

          <FormField label="Catatan" hint="Opsional." error={fieldErrors.notes?.[0]}>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan pembayaran..."
              maxLength={255}
              disabled={submitting}
            />
          </FormField>
        </div>

        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}