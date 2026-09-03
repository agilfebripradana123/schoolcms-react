import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { toApiError } from "@/lib/api/error";
import { formatDate, formatRupiah } from "@/lib/format";

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

function statusBadge(status: string): { label: string; tone: string } {
  switch (status) {
    case "paid":
      return { label: "Lunas", tone: "bg-emerald-100 text-emerald-700 ring-emerald-200" };
    case "partial":
      return { label: "Sebagian", tone: "bg-amber-100 text-amber-700 ring-amber-200" };
    case "cancelled":
      return { label: "Dibatalkan", tone: "bg-slate-200 text-slate-600 ring-slate-300" };
    default:
      return { label: "Belum lunas", tone: "bg-rose-100 text-rose-700 ring-rose-200" };
  }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">{billingTitle(billing)}</h2>
        <dl className="mt-4 space-y-3 text-sm">
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
          <div className="flex justify-between">
            <dt className="text-slate-500">Status</dt>
            <dd>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${badge.tone}`}>
                {badge.label}
              </span>
            </dd>
          </div>
          {billing.notes && (
            <div>
              <dt className="text-slate-500">Catatan</dt>
              <dd className="mt-1 text-slate-700">{billing.notes}</dd>
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
          <h1 className="text-2xl font-bold text-slate-900">Tagihan</h1>
          <p className="mt-1 text-sm text-slate-500">Daftar tagihan keuangan Anda</p>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-slate-400">Belum ada tagihan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tagihan</h1>
        <p className="mt-1 text-sm text-slate-500">Daftar tagihan keuangan Anda</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Jenis Tagihan
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Nominal
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Jatuh Tempo
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row) => {
              const badge = statusBadge(row.status);
              return (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {billingTitle(row)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatRupiah(row.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDate(row.due_date)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${badge.tone}`}>
                      {badge.label}
                    </span>
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

      {detail && <BillingDetailDialog billing={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
