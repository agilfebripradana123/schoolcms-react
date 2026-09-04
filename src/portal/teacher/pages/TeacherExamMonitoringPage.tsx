import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  myExamMonitoringService,
  type ExamAttemptMonitoring,
  type ExamAttemptStatus,
} from "@/features/examinations";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import Select from "@/components/ui/Select";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { SelectOption } from "@/components/ui/Select";

const statusVariants: Record<ExamAttemptStatus, "primary" | "success" | "danger"> = {
  active: "primary",
  submitted: "success",
  expired: "danger",
};

const statusLabels: Record<ExamAttemptStatus, string> = {
  active: "Sedang Mengerjakan",
  submitted: "Selesai",
  expired: "Waktu Habis",
};

const statusOptions: SelectOption<ExamAttemptStatus | "">[] = [
  { value: "active", label: "Sedang Mengerjakan" },
  { value: "submitted", label: "Selesai" },
  { value: "expired", label: "Waktu Habis" },
];

export default function TeacherExamMonitoringPage() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<ExamAttemptMonitoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ExamAttemptStatus | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await myExamMonitoringService.list({
        page: currentPage,
        per_page: 15,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });

      setAttempts(response.data);
      setTotalPages(response.meta.last_page);
      setTotal(response.meta.total);
    } catch {
      setError("Gagal memuat data monitoring");
      toast.error("Gagal memuat data monitoring");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAttempts();
  };

  const handleViewDetail = (attemptId: number) => {
    navigate(`/guru/exams/monitoring/${attemptId}`);
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const columns = [
    {
      header: "Siswa",
      accessor: "student" as keyof ExamAttemptMonitoring,
      render: (_: unknown, row: ExamAttemptMonitoring) => (
        <div>
          <div className="font-medium text-on-surface">{row.student.name}</div>
          <div className="text-xs text-on-surface-variant">{row.student.nis}</div>
        </div>
      ),
    },
    {
      header: "Ujian",
      accessor: "exam" as keyof ExamAttemptMonitoring,
      render: (_: unknown, row: ExamAttemptMonitoring) => (
        <div>
          <div className="font-medium text-on-surface">{row.exam.title}</div>
          <div className="text-xs text-on-surface-variant">{row.exam.subject.name}</div>
        </div>
      ),
    },
    {
      header: "Attempt",
      accessor: "attempt_number" as keyof ExamAttemptMonitoring,
      render: (_: unknown, row: ExamAttemptMonitoring) => `#${row.attempt_number}`,
    },
    {
      header: "Status",
      accessor: "status" as keyof ExamAttemptMonitoring,
      render: (_: unknown, row: ExamAttemptMonitoring) => (
        <Badge variant={statusVariants[row.status]}>
          {statusLabels[row.status]}
        </Badge>
      ),
    },
    {
      header: "Progress",
      accessor: "progress" as keyof ExamAttemptMonitoring,
      render: (_: unknown, row: ExamAttemptMonitoring) => (
        <div>
          <div className="text-sm text-on-surface">
            {row.progress.answered}/{row.progress.total_questions}
          </div>
          <div className="text-xs text-on-surface-variant">
            {row.progress.percentage.toFixed(0)}%
          </div>
        </div>
      ),
    },
    {
      header: "Waktu Tersisa",
      accessor: "remaining_seconds" as keyof ExamAttemptMonitoring,
      render: (_: unknown, row: ExamAttemptMonitoring) =>
        row.status === "active"
          ? formatDuration(row.remaining_seconds)
          : "-",
    },
    {
      header: "Events",
      accessor: "event_count" as keyof ExamAttemptMonitoring,
      render: (_: unknown, row: ExamAttemptMonitoring) => (
        <Badge variant="secondary">{row.event_count}</Badge>
      ),
    },
    {
      header: "Aksi",
      accessor: "id" as keyof ExamAttemptMonitoring,
      render: (_: unknown, row: ExamAttemptMonitoring) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetail(row.id)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Detail
        </Button>
      ),
    },
  ];

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Monitoring Ujian"
        description="Monitor aktivitas siswa selama ujian berlangsung"
        actions={
          <Button
            variant="secondary"
            onClick={fetchAttempts}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Muat Ulang
          </Button>
        }
      />

      <Card>
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Cari Siswa
            </label>
            <Search
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari siswa (nama/NIS)..."
              autoFocus={false}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Status
            </label>
            <Select<ExamAttemptStatus | "">
              options={statusOptions}
              value={statusFilter || null}
              onChange={(v) => setStatusFilter(v ?? "")}
              placeholder="Semua Status"
              isClearable
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleSearch} className="w-full">
              Tampilkan
            </Button>
          </div>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">{error}</p>
            <Button variant="secondary" size="sm" onClick={fetchAttempts}>
              Muat Ulang
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={attempts}
            loading={loading}
            emptyMessage="Belum ada peserta ujian."
          />
        )}

        {!loading && !error && attempts.length > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-on-surface-variant">
              Menampilkan{" "}
              {(currentPage - 1) * 15 + 1}–{Math.min(currentPage * 15, total)}{" "}
              dari {total} data
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-on-surface-variant">
                Halaman {currentPage} dari {totalPages || 1}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
