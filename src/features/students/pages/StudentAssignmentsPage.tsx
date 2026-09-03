import { useCallback, useEffect, useState } from "react";
import { Loader2, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";
import { formatDate } from "@/lib/format";

interface Assignment {
  id: number;
  title: string;
  description?: string | null;
  subject_id: number;
  class_id: number;
  teacher_id?: number | null;
  due_date?: string | null;
  subject?: { name: string } | null;
  created_at?: string | null;
}

export default function StudentAssignmentsPage() {
  const [rows, setRows] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: Assignment[] }>(STUDENTS.ASSIGNMENTS);
      setRows(res.data ?? []);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      toast.error("Gagal memuat tugas", { description: apiErr.message });
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
          <h1 className="text-2xl font-bold text-slate-900">Tugas</h1>
          <p className="mt-1 text-sm text-slate-500">Daftar tugas yang harus dikerjakan</p>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <Calendar className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">Belum ada tugas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tugas</h1>
        <p className="mt-1 text-sm text-slate-500">Daftar tugas yang harus dikerjakan</p>
      </div>

      <div className="space-y-3">
        {rows.map((a) => (
          <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{a.title}</h3>
                <p className="mt-1 text-sm text-slate-600 line-clamp-2">{a.description ?? "Tidak ada deskripsi"}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {a.subject?.name ?? `Mata pelajaran #${a.subject_id}`}
                  </span>
                  {a.due_date && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Jatuh tempo: {formatDate(a.due_date)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 ring-1 ring-amber-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Belum dikumpulkan
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          <strong>Catatan:</strong> Fitur pengumpulan tugas (submission) belum tersedia. 
          Silakan hubungi guru mata pelajaran untuk tata cara pengumpulan.
        </p>
      </div>
    </div>
  );
}