import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ApiError } from "@/types";
import { paymentTransactionService } from "../../api/payment-transaction.service";
import { paymentService } from "../../api/payment.service";
import type {
  CreatePaymentTransactionPayload,
  Payment,
  PaymentMethod,
  PaymentTransaction,
  TransactionStatus,
  TransactionType,
} from "../../api/types";

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: PaymentTransaction | null;
}

const TYPE_OPTIONS: Array<{ value: TransactionType; label: string }> = [
  { value: "payment", label: "Pembayaran" },
  { value: "refund", label: "Pengembalian" },
  { value: "adjustment", label: "Penyesuaian" },
];

const METHOD_OPTIONS: Array<{ value: PaymentMethod; label: string }> = [
  { value: "cash", label: "Tunai" },
  { value: "transfer", label: "Transfer" },
  { value: "qris", label: "QRIS" },
  { value: "lainnya", label: "Lainnya" },
];

const STATUS_OPTIONS: Array<{ value: TransactionStatus; label: string }> = [
  { value: "success", label: "Berhasil" },
  { value: "pending", label: "Menunggu" },
  { value: "failed", label: "Gagal" },
];

function paymentLabel(p: Payment): string {
  const student = p.student?.name ?? `#${p.student_id}`;
  const amount = p.amount != null ? ` - ${formatCurrency(p.amount)}` : "";
  const date = p.payment_date ? ` (${formatDate(p.payment_date)})` : "";
  return `${student}${amount}${date}`;
}

export default function TransactionForm({
  open,
  onClose,
  onSaved,
  initialData,
}: TransactionFormProps) {
  const [paymentId, setPaymentId] = useState<string>("");
  const [transactionCode, setTransactionCode] = useState("");
  const [type, setType] = useState<TransactionType>("payment");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [status, setStatus] = useState<TransactionStatus>("success");
  const [transactionDate, setTransactionDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadPayments = useCallback(() => {
    setPaymentsLoading(true);
    setPaymentsError(false);
    paymentService
      .list({ per_page: 200 })
      .then((res) => {
        setPayments(res.data);
        setPaymentsError(false);
      })
      .catch(() => {
        setPaymentsError(true);
      })
      .finally(() => {
        setPaymentsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});
      loadPayments();

      if (initialData) {
        setPaymentId(String(initialData.payment_id));
        setTransactionCode(initialData.transaction_code);
        setType(initialData.type);
        setAmount(initialData.amount != null ? String(initialData.amount) : "");
        setMethod(initialData.method);
        setStatus(initialData.status);
        setTransactionDate(
          initialData.transaction_date
            ? initialData.transaction_date.substring(0, 10)
            : "",
        );
      } else {
        setPaymentId("");
        setTransactionCode("");
        setType("payment");
        setAmount("");
        setMethod("cash");
        setStatus("success");
        setTransactionDate("");
      }
    }
  }, [open, initialData, loadPayments]);

  const handlePaymentChange = useCallback(
    (value: string) => {
      setPaymentId(value);
      const payment = payments.find((p) => String(p.id) === value);
      if (payment && payment.amount != null) setAmount(String(payment.amount));
    },
    [payments],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const amountNum = Number(amount);
    if (!amount || Number.isNaN(amountNum)) {
      setError({ message: "Jumlah transaksi wajib diisi dengan angka." });
      setSubmitting(false);
      return;
    }

    const payload: CreatePaymentTransactionPayload = {
      payment_id: Number(paymentId),
      transaction_code: transactionCode.trim(),
      type,
      amount: amountNum,
      method,
      status,
      transaction_date: transactionDate,
    };

    try {
      if (initialData) {
        await paymentTransactionService.update(initialData.id, payload);
        toast.success("Transaksi berhasil diperbarui.");
      } else {
        await paymentTransactionService.create(payload);
        toast.success("Transaksi berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan transaksi", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const paymentOptions = payments.map((p) => ({ value: String(p.id), label: paymentLabel(p) }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Transaksi" : "Tambah Transaksi"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="transaction-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="transaction-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Pembayaran" required error={fieldErrors.payment_id?.[0]}>
            {paymentsLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat pembayaran...
              </div>
            ) : paymentsError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data pembayaran.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadPayments}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : payments.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada pembayaran tersedia.
              </p>
            ) : (
              <AppSelect
                value={paymentId}
                onChange={(v) => handlePaymentChange(v ?? "")}
                options={paymentOptions}
                placeholder="Pilih Pembayaran"
                isDisabled={submitting}
              />
            )}
          </FormField>

          <FormField label="Kode Transaksi" required error={fieldErrors.transaction_code?.[0]}>
            <Input
              value={transactionCode}
              onChange={(e) => setTransactionCode(e.target.value)}
              placeholder="TXN-2026-0001"
              maxLength={50}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Tipe" required error={fieldErrors.type?.[0]}>
            <AppSelect
              value={type}
              onChange={(v) => setType((v ?? "payment") as TransactionType)}
              options={TYPE_OPTIONS}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>

          <FormField
            label="Jumlah"
            required
            hint={type === "refund" ? "Gunakan nilai negatif untuk pengembalian." : "Nominal rupiah."}
            error={fieldErrors.amount?.[0]}
          >
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={type === "refund" ? "-250000" : "250000"}
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

          <FormField label="Status" required error={fieldErrors.status?.[0]}>
            <AppSelect
              value={status}
              onChange={(v) => setStatus((v ?? "success") as TransactionStatus)}
              options={STATUS_OPTIONS}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Tanggal Transaksi" required error={fieldErrors.transaction_date?.[0]}>
          <Input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            disabled={submitting}
          />
        </FormField>

        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}