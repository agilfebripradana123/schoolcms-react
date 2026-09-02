import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toApiError } from "@/lib/api/error";
import { toast } from "sonner";

interface FinanceTotals {
  total_billed: number;
  total_paid: number;
  total_outstanding: number;
}

export default function StudentFinanceSummaryPage() {
  const [totals, setTotals] = useState<FinanceTotals | null>(null);

  useEffect(() => {
    api
      .get<{ success: boolean; data: { totals: FinanceTotals } }>(
        "/student/finance/summary",
      )
      .then((res) => setTotals(res.data.totals))
      .catch((err) => {
        const msg = toApiError(err).message;
        toast.error("Gagal memuat data keuangan", { description: msg });
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ringkasan Keuangan</h1>
        <p className="text-slate-500">Data pembayaran dan tagihan Anda</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Tagihan</p>
          <p className="text-xl font-bold">{formatRupiah(totals?.total_billed)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Dibayar</p>
          <p className="text-xl font-bold text-emerald-600">
            {formatRupiah(totals?.total_paid)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Sisa</p>
          <p className="text-xl font-bold text-rose-600">
            {formatRupiah(totals?.total_outstanding)}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatRupiah(value?: number): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}
