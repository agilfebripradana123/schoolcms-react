import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { toApiError } from "@/lib/api/error";
import { formatRupiah } from "@/lib/format";

interface SummaryData {
  totals: {
    total_billed: number;
    total_paid: number;
    total_outstanding: number;
  };
  status?: string;
  paid_percentage?: number;
}

export default function StudentFinanceSummaryPage() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: SummaryData }>(
        "/student/finance/summary",
      );
      setData(res.data);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      toast.error("Gagal memuat ringkasan keuangan", {
        description: apiErr.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  const totals = data?.totals;
  const outstanding = totals?.total_outstanding ?? 0;
  const billed = totals?.total_billed ?? 0;
  const percentage =
    billed > 0 ? Math.round(((totals?.total_paid ?? 0) / billed) * 100) : 0;

  const statusLabel =
    outstanding <= 0 ? "Lunas" : outstanding < billed ? "Sebagian" : "Belum lunas";
  const statusTone =
    outstanding <= 0
      ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
      : outstanding < billed
        ? "bg-amber-100 text-amber-700 ring-amber-200"
        : "bg-rose-100 text-rose-700 ring-rose-200";

  const progressTone =
    outstanding <= 0
      ? "bg-emerald-600"
      : outstanding < billed
        ? "bg-amber-500"
        : "bg-rose-500";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ringkasan Keuangan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan tagihan dan pembayaran Anda
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Tagihan</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatRupiah(totals?.total_billed)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Dibayar</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {formatRupiah(totals?.total_paid)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Sisa Tagihan</p>
          <p className="mt-1 text-2xl font-bold text-rose-600">
            {formatRupiah(totals?.total_outstanding)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Status Pembayaran</h2>
        <div className="mt-3 flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusTone}`}
          >
            {statusLabel}
          </span>
          <span className="text-sm text-slate-500">{percentage}% dibayar</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-2 rounded-full transition-all ${progressTone}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
            aria-hidden
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Progress pembayaran dihitung dari total dibayar terhadap total tagihan.
        </p>
      </div>
    </div>
  );
}
