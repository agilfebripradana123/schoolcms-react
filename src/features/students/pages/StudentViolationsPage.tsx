import { useCallback, useEffect, useState } from "react";
import { Loader2, ShieldAlert, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";
import { formatDate } from "@/lib/format";

interface ViolationRow {
  id: number;
  category: string;
  description: string;
  points: number;
  violated_at: string | null;
}

export default function StudentViolationsPage() {
  const [rows, setRows] = useState<ViolationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: ViolationRow[] }>(
        STUDENTS.VIOLATIONS,
      );
      setRows(res.data ?? []);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      toast.error("Gagal memuat pelanggaran", { description: apiErr.message });
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

  const totalPoints = rows.reduce((sum, v) => sum + (v.points ?? 0), 0);

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pelanggaran</h1>
          <p className="mt-1 text-sm text-slate-500">Catatan pelanggaran</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-12 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-10 w-10 text-emerald-400" />
          <p className="mt-3 text-sm font-medium text-emerald-700">Tidak ada catatan pelanggaran</p>
          <p className="mt-1 text-sm text-emerald-600">Pertahankan perilaku baik!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pelanggaran</h1>
        <p className="mt-1 text-sm text-slate-500">Catatan pelanggaran • Total poin: {totalPoints}</p>
      </div>

      <div className="space-y-3">
        {rows.map((v) => (
          <div key={v.id} className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{v.category}</h3>
                  {v.points != null && (
                    <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                      -{v.points} poin
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-600">{v.description}</p>
                {v.violated_at && (
                  <p className="mt-2 text-xs text-slate-500">
                    Tanggal: {formatDate(v.violated_at)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}