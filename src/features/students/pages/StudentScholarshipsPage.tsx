import { useCallback, useEffect, useState } from "react";
import { Loader2, Award } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { toApiError } from "@/lib/api/error";
import { formatDate, formatRupiah } from "@/lib/format";

interface ScholarshipRow {
  id: number;
  name: string;
  provider?: string | null;
  amount?: number | null;
  status: "aktif" | "selesai" | "dibatalkan" | string;
  start_date?: string | null;
  end_date?: string | null;
}

function statusBadge(v: string): { label: string; tone: string } {
  switch (v) {
    case "aktif":
      return { label: "Aktif", tone: "bg-emerald-100 text-emerald-700 ring-emerald-200" };
    case "selesai":
      return { label: "Selesai", tone: "bg-slate-100 text-slate-600 ring-slate-200" };
    case "dibatalkan":
      return { label: "Dibatalkan", tone: "bg-rose-100 text-rose-700 ring-rose-200" };
    default:
      return { label: v, tone: "bg-slate-100 text-slate-600 ring-slate-200" };
  }
}

function ScholarshipDetailDialog({
  scholarship,
  onClose,
}: {
  scholarship: ScholarshipRow;
  onClose: () => void;
}) {
  const badge = statusBadge(scholarship.status);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Award className="h-8 w-8 text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-900">{scholarship.name}</h2>
        </div>
        <dl className="space-y-3 text-sm">
          {scholarship.provider && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Penyedia</dt>
              <dd className="font-medium text-slate-700">{scholarship.provider}</dd>
            </div>
          )}
          {scholarship.amount != null && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Nominal</dt>
              <dd className="font-semibold text-slate-900">{formatRupiah(scholarship.amount)}</dd>
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
          {scholarship.start_date && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Mulai</dt>
              <dd className="font-medium text-slate-700">{formatDate(scholarship.start_date)}</dd>
            </div>
          )}
          {scholarship.end_date && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Berakhir</dt>
              <dd className="font-medium text-slate-700">{formatDate(scholarship.end_date)}</dd>
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

export default function StudentScholarshipsPage() {
  const [rows, setRows] = useState<ScholarshipRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<ScholarshipRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: ScholarshipRow[] }>(
        "/student/finance/scholarships",
      );
      setRows(res.data ?? []);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      toast.error("Gagal memuat beasiswa", { description: apiErr.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const fetchDetail = async (id: number) => {
    try {
      const res = await api.get<{ success: boolean; data: ScholarshipRow }>(
        `/student/finance/scholarships/${id}`,
      );
      setDetail(res.data);
    } catch (err) {
      toast.error("Gagal memuat detail beasiswa", {
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
          <h1 className="text-2xl font-bold text-slate-900">Beasiswa</h1>
          <p className="mt-1 text-sm text-slate-500">Beasiswa yang Anda terima</p>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <Award className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">Belum ada beasiswa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Beasiswa</h1>
        <p className="mt-1 text-sm text-slate-500">Beasiswa yang Anda terima</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => {
          const badge = statusBadge(row.status);
          return (
            <button
              key={row.id}
              onClick={() => fetchDetail(row.id)}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-primary-300 transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <Award className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {row.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {row.provider ?? "Sekolah"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ${badge.tone}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
              {row.amount != null && (
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-sm text-slate-400">Nominal</span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatRupiah(row.amount)}
                  </span>
                </div>
              )}
              {(row.start_date || row.end_date) && (
                <div className="mt-3 text-[11px] text-slate-400">
                  {row.start_date && (
                    <>
                      Mulai: {formatDate(row.start_date)}
                      {row.end_date && " · "}
                    </>
                  )}
                  {row.end_date && <span>Berakhir: {formatDate(row.end_date)}</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {detail && <ScholarshipDetailDialog scholarship={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}