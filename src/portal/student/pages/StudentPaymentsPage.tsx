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

interface PaymentRow {
  id: number;
  amount: number;
  payment_date?: string | null;
  method?: string | null;
  reference_number?: string | null;
  notes?: string | null;
  billing?: { id: number; fee_type?: { name: string } | null } | null;
  created_at?: string | null;
}

function methodLabel(v?: string | null): string {
  const map: Record<string, string> = {
    cash: "Tunai",
    transfer: "Transfer",
    qris: "QRIS",
    lainnya: "Lainnya",
  };
  if (!v) return "-";
  return map[v] ?? v;
}

function PaymentDetailDialog({
  payment,
  onClose,
}: {
  payment: PaymentRow;
  onClose: () => void;
}) {
  return (
    <Modal open onClose={onClose} title={`Detail Pembayaran #${payment.id}`}>
      <PortalDetailRows
        rows={[
          ...(payment.billing?.fee_type?.name
            ? [{ label: "Tagihan", value: payment.billing.fee_type.name }]
            : []),
          { label: "Nominal", value: formatRupiah(payment.amount) },
          {
            label: "Tanggal",
            value: formatDate(payment.payment_date ?? payment.created_at),
          },
          {
            label: "Metode",
            value: <Badge variant="secondary">{methodLabel(payment.method)}</Badge>,
          },
          ...(payment.reference_number
            ? [{ label: "Referensi", value: payment.reference_number }]
            : []),
          ...(payment.notes ? [{ label: "Catatan", value: payment.notes }] : []),
        ]}
      />
      <div className="mt-6 flex justify-end">
        <Button variant="ghost" onClick={onClose}>Tutup</Button>
      </div>
    </Modal>
  );
}

export default function StudentPaymentsPage() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<PaymentRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: PaymentRow[] }>("/student/finance/payments");
      setRows(res.data ?? []);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      toast.error("Gagal memuat pembayaran", { description: apiErr.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const fetchDetail = async (id: number) => {
    try {
      const res = await api.get<{ success: boolean; data: PaymentRow }>(`/student/finance/payments/${id}`);
      setDetail(res.data);
    } catch (err) {
      toast.error("Gagal memuat detail pembayaran", { description: toApiError(err).message });
    }
  };

  const tableData = rows.map((r) => ({
    id: r.id,
    date: formatDate(r.payment_date ?? r.created_at),
    billing: r.billing?.fee_type?.name ?? `Tagihan #${r.billing?.id ?? r.id}`,
    amount: formatRupiah(r.amount),
    method: methodLabel(r.method),
    raw: r,
  }));

  const columns = [
    { header: "Tanggal", accessor: "date" as const },
    { header: "Tagihan", accessor: "billing" as const, render: (v: unknown) => <span className="font-medium text-slate-900">{String(v)}</span> },
    { header: "Nominal", accessor: "amount" as const, render: (v: unknown) => <span className="font-semibold text-slate-900">{String(v)}</span> },
    { header: "Metode", accessor: "method" as const, render: (v: unknown) => <Badge variant="secondary">{String(v)}</Badge> },
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
      <PageHeader title="Pembayaran" description="Riwayat pembayaran keuangan Anda" />

      {error ? (
        <PortalErrorState message={error} onRetry={load} />
      ) : (
        <DataTable columns={columns} data={tableData} loading={loading} emptyMessage="Belum ada pembayaran." />
      )}

      {detail && <PaymentDetailDialog payment={detail} onClose={() => setDetail(null)} />}
    </PageContainer>
  );
}