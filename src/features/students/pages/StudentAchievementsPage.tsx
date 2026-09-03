import { useCallback, useEffect, useState } from "react";
import { Loader2, Award, Calendar } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";
import { formatDate } from "@/lib/format";

interface AchievementRow {
  id: number;
  title: string;
  level?: string | null;
  organizer?: string | null;
  achievement_date?: string | null;
  description?: string | null;
}

export default function StudentAchievementsPage() {
  const [rows, setRows] = useState<AchievementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: AchievementRow[] }>(
        STUDENTS.ACHIEVEMENTS,
      );
      setRows(res.data ?? []);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      toast.error("Gagal memuat prestasi", { description: apiErr.message });
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
          <h1 className="text-2xl font-bold text-slate-900">Prestasi</h1>
          <p className="mt-1 text-sm text-slate-500">Prestasi yang Anda raih</p>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <Award className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">Belum ada prestasi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Prestasi</h1>
        <p className="mt-1 text-sm text-slate-500">Prestasi yang Anda raih</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((a) => (
          <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <Award className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900 truncate">{a.title}</h3>
                {a.organizer && (
                  <p className="text-sm text-slate-500 truncate">{a.organizer}</p>
                )}
              </div>
            </div>
            {a.level && (
              <span className="mt-3 inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                {a.level}
              </span>
            )}
            {a.description && (
              <p className="mt-2 text-sm text-slate-600 line-clamp-3">{a.description}</p>
            )}
            {a.achievement_date && (
              <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="h-3 w-3" />
                {formatDate(a.achievement_date)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}