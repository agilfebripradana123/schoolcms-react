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
import { Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<ExamAttemptStatus, string> = {
  active: "bg-blue-100 text-blue-800",
  submitted: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
};

const statusLabels: Record<ExamAttemptStatus, string> = {
  active: "Sedang Mengerjakan",
  submitted: "Selesai",
  expired: "Waktu Habis",
};

export default function TeacherExamMonitoringPage() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<ExamAttemptMonitoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ExamAttemptStatus | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const response = await myExamMonitoringService.list({
        page: currentPage,
        per_page: 15,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });

      setAttempts(response.data);
      setTotalPages(response.meta.last_page);
      setTotal(response.meta.total);
    } catch (error) {
      toast.error("Gagal memuat data monitoring");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
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
          <div className="font-medium">{row.student.name}</div>
          <div className="text-sm text-gray-500">{row.student.nis}</div>
        </div>
      ),
    },
    {
      header: "Ujian",
      accessor: "exam" as keyof ExamAttemptMonitoring,
      render: (_: unknown, row: ExamAttemptMonitoring) => (
        <div>
          <div className="font-medium">{row.exam.title}</div>
          <div className="text-sm text-gray-500">{row.exam.subject.name}</div>
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
        <Badge className={statusColors[row.status]}>
          {statusLabels[row.status]}
        </Badge>
      ),
    },
    {
      header: "Progress",
      accessor: "progress" as keyof ExamAttemptMonitoring,
      render: (_: unknown, row: ExamAttemptMonitoring) => (
        <div>
          <div className="text-sm">
            {row.progress.answered}/{row.progress.total_questions}
          </div>
          <div className="text-xs text-gray-500">
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
          <Eye className="w-4 h-4 mr-1" />
          Detail
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monitoring Ujian</h1>
          <p className="text-gray-600">
            Monitor aktivitas siswa selama ujian berlangsung
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={fetchAttempts}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari siswa (nama/NIS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ExamAttemptStatus | "")}
            className="w-48 px-4 py-2 border rounded-lg"
          >
            <option value="">Semua Status</option>
            <option value="active">Sedang Mengerjakan</option>
            <option value="submitted">Selesai</option>
            <option value="expired">Waktu Habis</option>
          </select>
          <Button onClick={handleSearch}>Cari</Button>
        </div>

        <DataTable
          columns={columns}
          data={attempts}
          loading={loading}
        />

        {!loading && attempts.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Total: {total} data
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
