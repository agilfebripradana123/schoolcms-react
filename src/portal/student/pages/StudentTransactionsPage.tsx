import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { toApiError } from "@/lib/api/error";
import { formatDate, formatRupiah } from "@/lib/format";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import PortalDetailRows from "@/portal/components/PortalDetailRows";
import PortalErrorState from "@/portal/components/PortalErrorState";
import Button from "@/components/ui/Button";

interface TransactionRow {
  id: number;
  transaction_code: string;
  type: "payment" | "refund" | "adjustment" | string;
  amount: number;
  method?: string | null;
  status: "success" | "pending" | "failed" | string;
  transaction_date?: string | null;
  payment?: { id: number } | null;
}

function typeBadge(v: string): { label: string; variant: "success" | "warning" | "primary" | "neutral" } {
  if (v === "payment") return { label: "Pembayaran", variant: "success" };
  if (v === "refund") return { label: "Pengembalian", variant: "warning" };
  if (v === "adjustment") return { label: "Penyesuaian", variant: "primary" };
  return { label: v, variant: "neutral" };
}

function statusBadge(v: string): { label: string; variant: "success" | "warning" | "danger" | "neutral" } {
  if (v === "success") return { label: "Berhasil", variant: "success" };
  if (v === "pending") return { label: "Menunggu", variant: "warning" };
  if (v === "failed") return { label: "Gagal", variant: "danger" };
  return { label: v, variant: "neutral" };
}

function TransactionDetailDialog({
  tx,
  onClose,
}: {
  tx: TransactionRow;
  onClose: () => void;
}) {
  const t = typeBadge(tx.type);
  const s = statusBadge(tx.status);
  return (
    <Modal open onClose={onClose} title="Detail Transaksi">
      <PortalDetailRows
        rows={[
          { label: "Kode", value: tx.transaction_code },
          {
            label: "Jenis",
            value: <Badge variant={t.variant}>{t.label}</Badge>,
          },
          {
            label: "Status",
            value: <Badge variant={s.variant}>{s.label}</Badge>,
          },
          { label: "Nominal", value: formatRupiah(tx.amount) },
          { label: "Tanggal", value: formatDate(tx.transaction_date) },
          ...(tx.payment?.id
            ? [{ label: "Pembayaran", value: `#${tx.payment.id}` }]
            : []),
        ]}
      />
      <div className="mt-6 flex justify-end">
        <Button variant="ghost" onClick={onClose}>Tutup</Button>
      </div>
    </Modal>
  );
}

export default function StudentTransactionsPage() {
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<TransactionRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: TransactionRow[] }>(
        "/student/finance/transactions",
      );
      setRows(res.data ?? []);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      toast.error("Gagal memuat transaksi", { description: apiErr.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const fetchDetail = async (id: number) => {
    try {
      const res = await api.get<{ success: boolean; data: TransactionRow }>(
        `/student/finance/transactions/${id}`,
      );
      setDetail(res.data);
    } catch (err) {
      toast.error("Gagal memuat detail transaksi", { description: toApiError(err).message });
    }
  };

  const tableData = rows.map((r) => ({
    id: r.id,
    transaction_code: r.transaction_code,
    type: typeBadge(r.type).label,
    typeVariant: typeBadge(r.type).variant,
    status: statusBadge(r.status).label,
    statusVariant: statusBadge(r.status).variant,
    amount: formatRupiah(r.amount),
    transaction_date: formatDate(r.transaction_date),
    raw: r,
  }));

  const columns = [
    { header: "Kode", accessor: "transaction_code" as const, render: (v: unknown) => <span className="font-mono text-sm text-slate-700">{String(v)}</span> },
    { header: "Jenis", accessor: "type" as const, render: (v: unknown, row: (typeof tableData)[number]) => <Badge variant={row.typeVariant as never}>{String(v)}</Badge> },
    { header: "Status", accessor: "status" as const, render: (v: unknown, row: (typeof tableData)[number]) => <Badge variant={row.statusVariant as never}>{String(v)}</Badge> },
    { header: "Nominal", accessor: "amount" as const, render: (v: unknown) => <span className="font-semibold text-slate-900">{String(v)}</span> },
    { header: "Tanggal", accessor: "transaction_date" as const },
    {
      header: "Aksi",
      accessor: "id" as const,
      render: (_v: unknown, row: (typeof tableData)[number]) => (
        <Button variant="ghost" size="sm" onClick={() => fetchDetail(row.id)}>Detail</Button>
      ),
      className: "px-6 py-4 text-right",
      headerClassName: "px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider",
    },
  ];

  return (
    <PageContainer>
      <PageHeader title="Transaksi" description="Riwayat transaksi keuangan Anda" />

      {error ? (
        <PortalErrorState message={error} onRetry={load} />
      ) : (
        <DataTable columns={columns} data={tableData} loading={loading} emptyMessage="Belum ada transaksi." />
      )}

      {detail && <TransactionDetailDialog tx={detail} onClose={() => setDetail(null)} />}
    </PageContainer>
  );
}