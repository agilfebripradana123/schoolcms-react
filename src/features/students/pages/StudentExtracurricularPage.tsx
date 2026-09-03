import { useCallback, useEffect, useState } from "react";
import { Loader2, Dumbbell, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";

interface ExtracurricularRow {
  id: number;
  name: string;
  description?: string | null;
  supervisor_id?: number | null;
  schedule_day?: string | null;
  is_active?: boolean;
}

export default function StudentExtracurricularPage() {
  const [rows, setRows] = useState<ExtracurricularRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: ExtracurricularRow[] }>(
        STUDENTS.EXTRACURRICULARS,
      );
      setRows(res.data ?? []);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      toast.error("Gagal memuat ekstrakurikuler", { description: apiErr.message });
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

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ekstrakurikuler</h1>
          <p className="mt-1 text-sm text-slate-500">Kegiatan ekstrakurikuler</p>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <Dumbbell className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">Belum ada kegiatan ekstrakurikuler.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ekstrakurikuler</h1>
        <p className="mt-1 text-sm text-slate-500">
          Daftar ekstrakurikuler • {rows.length} kegiatan
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((e) => (
          <div key={e.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900 truncate">{e.name}</h3>
                {e.is_active != null && (
                  <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${e.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {e.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                )}
              </div>
            </div>
            {e.description && (
              <p className="mt-3 text-sm text-slate-600 line-clamp-3">{e.description}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
              {e.schedule_day && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {e.schedule_day}
                </span>
              )}
              {e.supervisor_id != null && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Pembina #{e.supervisor_id}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}