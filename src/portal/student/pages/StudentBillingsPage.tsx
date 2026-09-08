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

interface BillingRow {
  id: number;
  amount: number;
  paid?: number | null;
  outstanding?: number | null;
  due_date?: string | null;
  status: "unpaid" | "partial" | "paid" | "cancelled" | string;
  notes?: string | null;
  fee_type?: { name: string } | null;
  fee_type_name?: string | null;
  academic_year?: { name: string } | null;
  semester?: { name: string } | null;
  title?: string | null;
  description?: string | null;
}

function billingTitle(b: BillingRow): string {
  return (
    b.title ??
    b.fee_type?.name ??
    b.fee_type_name ??
    b.description ??
    `Tagihan #${b.id}`
  );
}

function statusBadge(status: string): { label: string; variant: "success" | "warning" | "danger" | "neutral" } {
  if (status === "paid") return { label: "Lunas", variant: "success" };
  if (status === "partial") return { label: "Sebagian", variant: "warning" };
  if (status === "cancelled") return { label: "Dibatalkan", variant: "neutral" };
  return { label: "Belum lunas", variant: "danger" };
}

function BillingDetailDialog({
  billing,
  onClose,
}: {
  billing: BillingRow;
  onClose: () => void;
}) {
  const badge = statusBadge(billing.status);
  return (
    <Modal open onClose={onClose} title={billingTitle(billing)}>
      <PortalDetailRows
        rows={[
          { label: "Nominal", value: formatRupiah(billing.amount) },
          ...(billing.paid != null
            ? [{ label: "Telah dibayar", value: formatRupiah(billing.paid) }]
            : []),
          ...(billing.outstanding != null
            ? [{ label: "Sisa", value: formatRupiah(billing.outstanding) }]
            : []),
          { label: "Jatuh tempo", value: formatDate(billing.due_date) },
          ...(billing.academic_year?.name
            ? [{ label: "Tahun ajaran", value: billing.academic_year.name }]
            : []),
          ...(billing.semester?.name
            ? [{ label: "Semester", value: billing.semester.name }]
            : []),
          {
            label: "Status",
            value: <Badge variant={badge.variant}>{badge.label}</Badge>,
          },
          ...(billing.notes ? [{ label: "Catatan", value: billing.notes }] : []),
        ]}
      />
      <div className="mt-6 flex justify-end">
        <Button variant="ghost" onClick={onClose}>Tutup</Button>
      </div>
    </Modal>
  );
}

export default function StudentBillingsPage() {
  const [rows, setRows] = useState<BillingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<BillingRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: BillingRow[] }>(
        "/student/finance/billings",
      );
      setRows(res.data ?? []);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      toast.error("Gagal memuat tagihan", { description: apiErr.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const fetchDetail = async (id: number) => {
    try {
      const res = await api.get<{ success: boolean; data: BillingRow }>(
        `/student/finance/billings/${id}`,
      );
      setDetail(res.data);
    } catch (err) {
      toast.error("Gagal memuat detail tagihan", {
        description: toApiError(err).message,
      });
    }
  };

  const tableData = rows.map((r) => ({
    id: r.id,
    title: billingTitle(r),
    amount: formatRupiah(r.amount),
    due_date: formatDate(r.due_date),
    status: r.status,
    raw: r,
  }));

  const columns = [
    { header: "Jenis Tagihan", accessor: "title" as const, render: (v: unknown) => <span className="font-medium text-slate-900">{String(v)}</span> },
    { header: "Nominal", accessor: "amount" as const },
    { header: "Jatuh Tempo", accessor: "due_date" as const },
    {
      header: "Status",
      accessor: "status" as const,
      render: (v: unknown) => {
        const b = statusBadge(String(v));
        return <Badge variant={b.variant}>{b.label}</Badge>;
      },
    },
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
      <PageHeader title="Tagihan" description="Daftar tagihan keuangan Anda" />

      {error ? (
        <PortalErrorState message={error} onRetry={load} />
      ) : (
        <DataTable columns={columns} data={tableData} loading={loading} emptyMessage="Belum ada tagihan." />
      )}

      {detail && <BillingDetailDialog billing={detail} onClose={() => setDetail(null)} />}
    </PageContainer>
  );
}