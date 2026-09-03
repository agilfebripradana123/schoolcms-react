import { useCallback, useEffect, useState } from "react";
import { Clock, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardBody } from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";

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

function statusVariant(s: string): "success" | "warning" | "danger" | "neutral" {
  if (s === "hadir") return "success";
  if (s === "sakit") return "warning";
  if (s === "alpa") return "danger";
  return "neutral";
}

export default function StudentAttendancePage() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("semua");

  const perPage = 20;

  const load = useCallback(async () => {
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
  }, [filterStatus, page]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const tableData = records.map((r) => ({
    id: r.id,
    date: new Date(r.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    status: STATUS_LABELS[r.status] ?? r.status,
    statusVariant: statusVariant(r.status),
    note: r.note ?? "-",
    class_name: r.class_name ?? "-",
  }));

  const columns = [
    { header: "Tanggal", accessor: "date" as const },
    {
      header: "Status",
      accessor: "status" as const,
      render: (v: unknown, row: (typeof tableData)[number]) => (
        <Badge variant={row.statusVariant}>{String(v)}</Badge>
      ),
    },
    { header: "Keterangan", accessor: "note" as const },
    { header: "Kelas", accessor: "class_name" as const },
  ];

  if (!loading && error) {
    return (
      <PageContainer>
        <PageHeader title="Kehadiran" description="Rekap kehadiran Anda" />
        <Card>
          <CardBody className="text-sm text-red-600">{error}</CardBody>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Kehadiran" description="Rekap kehadiran Anda" />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Hari
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {summary?.total_days ?? 0}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Kehadiran
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {summary?.present ?? 0}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Persentase
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {summary?.percentage.toFixed(1) ?? "0"}%
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Hadir</p>
            <p className="mt-1 text-lg font-bold text-emerald-600">
              {summary?.present ?? 0}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sakit</p>
            <p className="mt-1 text-lg font-bold text-amber-600">{summary?.sick ?? 0}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Izin</p>
            <p className="mt-1 text-lg font-bold text-sky-600">
              {summary?.permission ?? 0}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Alpa</p>
            <p className="mt-1 text-lg font-bold text-rose-600">{summary?.absent ?? 0}</p>
          </CardBody>
        </Card>
      </div>

      <Card className="mb-6">
        <CardBody className="flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-slate-500" />
          <label className="text-sm font-medium text-slate-700">Status:</label>
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
        </CardBody>
      </Card>

      {records.length === 0 && !loading ? (
        <Card>
          <CardBody className="p-6 text-center">
            <Calendar className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-400">
              Tidak ada data kehadiran untuk filter yang dipilih.
            </p>
          </CardBody>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={tableData}
          loading={loading}
          emptyMessage="Tidak ada data kehadiran."
        />
      )}
    </PageContainer>
  );
}