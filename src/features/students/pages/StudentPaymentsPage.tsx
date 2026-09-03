import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { toApiError } from "@/lib/api/error";
import { formatDate, formatRupiah } from "@/lib/format";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Detail Pembayaran #{payment.id}</h2>
        <dl className="mt-4 space-y-3 text-sm">
          {payment.billing?.fee_type?.name && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Tagihan</dt>
              <dd className="font-medium text-slate-700">{payment.billing.fee_type.name}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-slate-500">Nominal</dt>
            <dd className="font-semibold text-slate-900">{formatRupiah(payment.amount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Tanggal</dt>
            <dd className="font-medium text-slate-700">
              {formatDate(payment.payment_date ?? payment.created_at)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Metode</dt>
            <dd className="font-medium text-slate-700">{methodLabel(payment.method)}</dd>
          </div>
          {payment.reference_number && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Referensi</dt>
              <dd className="font-medium text-slate-700">{payment.reference_number}</dd>
            </div>
          )}
          {payment.notes && (
            <div>
              <dt className="text-slate-500">Catatan</dt>
              <dd className="mt-1 text-slate-700">{payment.notes}</dd>
            </div>
          )}
        </dl>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
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
      const res = await api.get<{ success: boolean; data: PaymentRow[] }>(
        "/student/finance/payments",
      );
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
      const res = await api.get<{ success: boolean; data: PaymentRow }>(
        `/student/finance/payments/${id}`,
      );
      setDetail(res.data);
    } catch (err) {
      toast.error("Gagal memuat detail pembayaran", {
        description: toApiError(err).message,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-600">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pembayaran</h1>
          <p className="mt-1 text-sm text-slate-500">Riwayat pembayaran keuangan Anda</p>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-slate-400">Belum ada pembayaran.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pembayaran</h1>
        <p className="mt-1 text-sm text-slate-500">Riwayat pembayaran keuangan Anda</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tagihan
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Nominal
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Metode
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-600">
                  {formatDate(row.payment_date ?? row.created_at)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {row.billing?.fee_type?.name ?? `Tagihan #${row.billing?.id ?? row.id}`}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                  {formatRupiah(row.amount)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {methodLabel(row.method)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => fetchDetail(row.id)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && <PaymentDetailDialog payment={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
