import { useEffect, useState } from "react";
import { Loader2, TrendingUp, BookOpen, Award } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";

interface GradeRow {
  subject_name: string;
  tugas: number | null;
  uts: number | null;
  uas: number | null;
  final_score: number | null;
}

interface Summary {
  average: number;
  highest: number;
  total_subjects: number;
}

interface SemesterOption {
  id: number;
  name: string;
}

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSemesters() {
    try {
      const res = await api.get<{ success: boolean; data: SemesterOption[] }>(
        "/semesters",
      );
      if (res.data) setSemesters(res.data);
    } catch {
      // optional
    }
  }

  async function load() {
    try {
      const [gradesRes, summaryRes] = await Promise.all([
        api.get<{ success: boolean; data: GradeRow[] }>(STUDENTS.GRADES, {
          semester_id: selectedSemester ?? undefined,
        }),
        api.get<{ success: boolean; data: Summary }>(
          `${STUDENTS.GRADES}/summary`,
          { semester_id: selectedSemester ?? undefined },
        ),
      ]);
      setGrades(gradesRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      const msg = toApiError(err).message;
      setError(msg);
      toast.error("Gagal memuat nilai", { description: msg });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSemesters();
  }, []);

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSemester]);

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

  if (grades.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nilai Saya</h1>
          <p className="mt-1 text-sm text-slate-500">Nilai akademik Anda</p>
        </div>
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">Belum ada nilai.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nilai Saya</h1>
        <p className="mt-1 text-sm text-slate-500">Nilai akademik Anda</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Semester:</label>
        <select
          value={selectedSemester ?? ""}
          onChange={(e) => setSelectedSemester(e.target.value ? Number(e.target.value) : null)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Semua</option>
          {semesters.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Rata-rata
            </p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {summary?.average.toFixed(1) ?? "-"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Tertinggi
            </p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {summary?.highest ?? "-"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Mata Pelajaran
            </p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {summary?.total_subjects ?? "-"}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Mata Pelajaran
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tugas
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                UTS
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                UAS
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Nilai Akhir
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {grades.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {row.subject_name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {row.tugas ?? "-"}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {row.uts ?? "-"}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {row.uas ?? "-"}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                  {row.final_score ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}