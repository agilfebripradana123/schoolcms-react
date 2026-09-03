import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { toApiError } from "@/lib/api/error";
import { formatDate, formatRupiah } from "@/lib/format";

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

function typeLabel(v: string): { label: string; tone: string } {
  switch (v) {
    case "payment":
      return { label: "Pembayaran", tone: "bg-emerald-100 text-emerald-700 ring-emerald-200" };
    case "refund":
      return { label: "Pengembalian", tone: "bg-amber-100 text-amber-700 ring-amber-200" };
    case "adjustment":
      return { label: "Penyesuaian", tone: "bg-indigo-100 text-indigo-700 ring-indigo-200" };
    default:
      return { label: v, tone: "bg-slate-100 text-slate-600 ring-slate-200" };
  }
}

function statusBadge(v: string): { label: string; tone: string } {
  switch (v) {
    case "success":
      return { label: "Berhasil", tone: "bg-emerald-100 text-emerald-700 ring-emerald-200" };
    case "pending":
      return { label: "Menunggu", tone: "bg-amber-100 text-amber-700 ring-amber-200" };
    case "failed":
      return { label: "Gagal", tone: "bg-rose-100 text-rose-700 ring-rose-200" };
    default:
      return { label: v, tone: "bg-slate-100 text-slate-600 ring-slate-200" };
  }
}

function TransactionDetailDialog({
  tx,
  onClose,
}: {
  tx: TransactionRow;
  onClose: () => void;
}) {
  const t = typeLabel(tx.type);
  const s = statusBadge(tx.status);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Detail Transaksi</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Kode</dt>
            <dd className="font-mono font-medium text-slate-900">{tx.transaction_code}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Jenis</dt>
            <dd>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${t.tone}`}>
                {t.label}
              </span>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Status</dt>
            <dd>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${s.tone}`}>
                {s.label}
              </span>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Nominal</dt>
            <dd className="font-semibold text-slate-900">{formatRupiah(tx.amount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Tanggal</dt>
            <dd className="font-medium text-slate-700">{formatDate(tx.transaction_date)}</dd>
          </div>
          {tx.payment?.id && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Pembayaran</dt>
              <dd className="font-medium text-slate-700">#{tx.payment.id}</dd>
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
      toast.error("Gagal memuat detail transaksi", {
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
          <h1 className="text-2xl font-bold text-slate-900">Transaksi</h1>
          <p className="mt-1 text-sm text-slate-500">Riwayat transaksi keuangan Anda</p>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-slate-400">Belum ada transaksi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Transaksi</h1>
        <p className="mt-1 text-sm text-slate-500">Riwayat transaksi keuangan Anda</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Kode
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Jenis
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Nominal
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tanggal
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row) => {
              const t = typeLabel(row.type);
              const s = statusBadge(row.status);
              return (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-mono text-slate-700">
                    {row.transaction_code}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${t.tone}`}>
                      {t.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${s.tone}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {formatRupiah(row.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDate(row.transaction_date)}
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
              );
            })}
          </tbody>
        </table>
      </div>

      {detail && <TransactionDetailDialog tx={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}