import { useCallback, useEffect, useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ApiError } from "@/types";
import { billingService } from "../../api/billing.service";
import type {
  Billing,
  BillingStatus,
  Payment,
  PaymentTransaction,
} from "../../api/types";

interface BillingDetailProps {
  open: boolean;
  onClose: () => void;
  billingId: number | string | null;
}

const STATUS_LABELS: Record<BillingStatus, string> = {
  unpaid: "Belum Bayar",
  partial: "Sebagian",
  paid: "Lunas",
  cancelled: "Dibatalkan",
};

const STATUS_VARIANTS: Record<
  BillingStatus,
  "danger" | "warning" | "success" | "secondary"
> = {
  unpaid: "danger",
  partial: "warning",
  paid: "success",
  cancelled: "secondary",
};

const TX_STATUS_LABELS: Record<string, string> = {
  success: "Berhasil",
  pending: "Tertunda",
  failed: "Gagal",
};

const METHOD_LABELS: Record<string, string> = {
  cash: "Tunai",
  transfer: "Transfer",
  qris: "QRIS",
  lainnya: "Lainnya",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
      {children}
    </h3>
  );
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-outline">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-on-surface">{value ?? "-"}</dd>
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
      {children}
    </dl>
  );
}

export default function BillingDetail({
  open,
  onClose,
  billingId,
}: BillingDetailProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [billing, setBilling] = useState<Billing | null>(null);

  const load = useCallback(() => {
    if (!open || billingId === null) return;
    let active = true;
    setLoading(true);
    setError(null);
    setBilling(null);

    billingService
      .get(billingId)
      .then((res) => {
        if (!active) return;
        setBilling(res.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(toApiError(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, billingId]);

  useEffect(() => {
    return load();
  }, [load]);

  const payments: Payment[] = billing?.payments ?? [];

  const renderTransactions = (payment: Payment) => {
    const txs: PaymentTransaction[] = payment.transactions ?? [];
    if (txs.length === 0) {
      return (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <div className="flex min-w-0 flex-col">
            <p className="text-sm font-medium text-on-surface">
              {payment.reference_number || "-"}
            </p>
            <p className="text-xs text-on-surface-variant">
              {formatDate(payment.payment_date)}
              {payment.method ? ` · ${METHOD_LABELS[payment.method] ?? payment.method}` : ""}
            </p>
          </div>
          <p className="text-sm font-semibold text-on-surface whitespace-nowrap">
            {formatCurrency(payment.amount)}
          </p>
        </div>
      );
    }

    return (
      <ul className="space-y-3">
        {txs.map((tx) => (
          <li
            key={tx.id}
            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"
          >
            <div className="flex min-w-0 flex-col">
              <p className="text-sm font-medium text-on-surface">
                {tx.transaction_code}
              </p>
              <p className="text-xs text-on-surface-variant">
                {formatDate(tx.transaction_date)}
                {tx.type !== "payment" ? ` · ${tx.type}` : ""}
                {tx.method ? ` · ${METHOD_LABELS[tx.method] ?? tx.method}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-on-surface whitespace-nowrap">
                {formatCurrency(tx.amount)}
              </p>
              <Badge
                variant={
                  tx.status === "success"
                    ? "success"
                    : tx.status === "failed"
                      ? "danger"
                      : "warning"
                }
              >
                {TX_STATUS_LABELS[tx.status] ?? tx.status}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const emptyText = (
    <p className="text-sm text-on-surface-variant">Belum ada pembayaran.</p>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail Tagihan"
      size="lg"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-slate-200"
        >
          Tutup
        </button>
      }
    >
      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">
          Memuat data tagihan...
        </p>
      ) : error ? (
        <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-xl py-8">
          <p className="text-sm text-error">Gagal memuat data tagihan.</p>
          <Button variant="secondary" onClick={load}>
            Muat Ulang
          </Button>
        </div>
      ) : billing ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-lg font-semibold text-on-surface">
              Tagihan #{billing.id}
            </p>
            <Badge
              variant={STATUS_VARIANTS[billing.status] ?? "secondary"}
              className="shrink-0"
            >
              {STATUS_LABELS[billing.status] ?? billing.status}
            </Badge>
          </div>

          <section>
            <SectionTitle>Informasi Tagihan</SectionTitle>
            <div className="rounded-2xl border border-slate-200 p-5">
              <FieldGrid>
                <Field label="Jenis Tagihan" value={billing.fee_type?.name} />
                <Field
                  label="Jumlah"
                  value={
                    billing.amount != null
                      ? formatCurrency(billing.amount)
                      : "-"
                  }
                />
                <Field
                  label="Jatuh Tempo"
                  value={billing.due_date ? formatDate(billing.due_date) : "-"}
                />
                <Field label="Tahun Ajaran" value={billing.academic_year?.name} />
                <Field
                  label="Semester"
                  value={
                    billing.semester
                      ? `Semester ${billing.semester.name}`
                      : "-"
                  }
                />
                <Field label="Catatan" value={billing.notes} />
              </FieldGrid>
            </div>
          </section>

          <section>
            <SectionTitle>Informasi Siswa</SectionTitle>
            <div className="rounded-2xl border border-slate-200 p-5">
              <FieldGrid>
                <Field label="Nama" value={billing.student?.name} />
                <Field label="NIS" value={billing.student?.nis} />
                <Field label="NISN" value={billing.student?.nisn} />
              </FieldGrid>
            </div>
          </section>

          <section>
            <SectionTitle>Ringkasan Pembayaran</SectionTitle>
            <div className="rounded-2xl border border-slate-200 p-5">
              <FieldGrid>
                <Field
                  label="Total"
                  value={
                    billing.amount != null
                      ? formatCurrency(billing.amount)
                      : "-"
                  }
                />
                <Field
                  label="Sudah Dibayar"
                  value={
                    billing.paid != null ? formatCurrency(billing.paid) : "-"
                  }
                />
                <Field
                  label="Sisa"
                  value={
                    billing.outstanding != null
                      ? formatCurrency(billing.outstanding)
                      : "-"
                  }
                />
              </FieldGrid>
            </div>
          </section>

          <section>
            <SectionTitle>Riwayat Pembayaran</SectionTitle>
            <div className="rounded-2xl border border-slate-200 p-5">
              {payments.length === 0 ? (
                emptyText
              ) : (
                <div className="space-y-5">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                    >
                      {renderTransactions(payment)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-slate-500">
          Data tagihan tidak tersedia.
        </p>
      )}
    </Modal>
  );
}
