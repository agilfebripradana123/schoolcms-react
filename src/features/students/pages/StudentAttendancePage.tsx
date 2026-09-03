import { useEffect, useState } from "react";
import { Loader2, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";

interface AttendanceRecord {
  id: number;
  date: string;
  status: "hadir" | "sakit" | "izin" | "alpa";
  note: string | null;
  class_name: string;
}

interface AttendanceSummary {
  total_days: number;
  present: number;
  sick: number;
  permission: number;
  absent: number;
  percentage: number;
}

const STATUS_LABELS: Record<string, string> = {
  hadir: "Hadir",
  sakit: "Sakit",
  izin: "Izin",
  alpa: "Alpa",
};

const STATUS_COLORS: Record<string, string> = {
  hadir: "bg-emerald-100 text-emerald-700",
  sakit: "bg-amber-100 text-amber-700",
  izin: "bg-blue-100 text-blue-700",
  alpa: "bg-rose-100 text-rose-700",
};

export default function StudentAttendancePage() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("semua");

  const perPage = 20;

  async function load() {
    try {
      const [summaryRes, historyRes] = await Promise.all([
        api.get<{ success: boolean; data: AttendanceSummary }>(
          `${STUDENTS.ATTENDANCE}/summary`,
        ),
        api.get<{ success: boolean; data: AttendanceRecord[] }>(STUDENTS.ATTENDANCE, {
          status: filterStatus === "semua" ? undefined : filterStatus,
          page,
          per_page: perPage,
        }),
      ]);
      setSummary(summaryRes.data);
      setRecords(historyRes.data);
    } catch (err) {
      const msg = toApiError(err).message;
      setError(msg);
      toast.error("Gagal memuat kehadiran", { description: msg });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterStatus]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kehadiran</h1>
        <p className="mt-1 text-sm text-slate-500">Rekap kehadiran Anda</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total Hari
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {summary?.total_days ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Kehadiran
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {summary?.present ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Persentase
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {summary?.percentage.toFixed(1) ?? "0"}%
          </p>
        </div>
      </div>

      {/* Detail breakdown */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Hadir
          </p>
          <p className="mt-1 text-lg font-bold text-emerald-600">
            {summary?.present ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Sakit
          </p>
          <p className="mt-1 text-lg font-bold text-amber-600">
            {summary?.sick ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Izin
          </p>
          <p className="mt-1 text-lg font-bold text-blue-600">
            {summary?.permission ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Alpa
          </p>
          <p className="mt-1 text-lg font-bold text-rose-600">
            {summary?.absent ?? 0}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-slate-500" />
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="semua">Semua Status</option>
          <option value="hadir">Hadir</option>
          <option value="sakit">Sakit</option>
          <option value="izin">Izin</option>
          <option value="alpa">Alpa</option>
        </select>
      </div>

      {/* History table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {records.length > 0 ? (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Keterangan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Kelas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(r.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[r.status] || STATUS_COLORS.alpa
                      }`}
                    >
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {r.note ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {r.class_name ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center">
            <Calendar className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-400">
              Tidak ada data kehadiran untuk filter yang dipilih.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}