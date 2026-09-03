import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { toApiError } from "@/lib/api/error";
import { formatDate, formatRupiah } from "@/lib/format";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardBody } from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
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
    <Modal open onOpenChange={onClose} title={billingTitle(billing)}>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Nominal</dt>
          <dd className="font-semibold text-slate-900">{formatRupiah(billing.amount)}</dd>
        </div>
        {billing.paid != null && (
          <div className="flex justify-between">
            <dt className="text-slate-500">Telah dibayar</dt>
            <dd className="font-medium text-emerald-600">{formatRupiah(billing.paid)}</dd>
          </div>
        )}
        {billing.outstanding != null && (
          <div className="flex justify-between">
            <dt className="text-slate-500">Sisa</dt>
            <dd className="font-medium text-rose-600">{formatRupiah(billing.outstanding)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-slate-500">Jatuh tempo</dt>
          <dd className="font-medium text-slate-700">{formatDate(billing.due_date)}</dd>
        </div>
        {billing.academic_year?.name && (
          <div className="flex justify-between">
            <dt className="text-slate-500">Tahun ajaran</dt>
            <dd className="font-medium text-slate-700">{billing.academic_year.name}</dd>
          </div>
        )}
        {billing.semester?.name && (
          <div className="flex justify-between">
            <dt className="text-slate-500">Semester</dt>
            <dd className="font-medium text-slate-700">{billing.semester.name}</dd>
          </div>
        )}
        <div className="flex justify-between items-center">
          <dt className="text-slate-500">Status</dt>
          <dd><Badge variant={badge.variant}>{badge.label}</Badge></dd>
        </div>
        {billing.notes && (
          <div>
            <dt className="text-slate-500">Catatan</dt>
            <dd className="mt-1 text-slate-700">{billing.notes}</dd>
          </div>
        )}
      </dl>
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
        <Card>
          <CardBody className="text-sm text-red-600">{error}</CardBody>
        </Card>
      ) : (
        <DataTable columns={columns} data={tableData} loading={loading} emptyMessage="Belum ada tagihan." />
      )}

      {detail && <BillingDetailDialog billing={detail} onClose={() => setDetail(null)} />}
    </PageContainer>
  );
}