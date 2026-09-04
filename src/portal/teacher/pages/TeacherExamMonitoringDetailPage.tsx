import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  myExamMonitoringService,
  type ExamAttemptDetail,
  type ExamAttemptStatus,
} from "@/features/examinations";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
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

const eventTypeLabels: Record<string, string> = {
  visibility_change: "Tab Tidak Aktif",
  tab_switch: "Pindah Tab",
  fullscreen_exit: "Keluar Fullscreen",
  reconnect: "Reconnect",
  late_request: "Request Terlambat",
  multiple_session_attempt: "Multiple Session",
};

export default function TeacherExamMonitoringDetailPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<ExamAttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!attemptId) return;

      try {
        setLoading(true);
        const response = await myExamMonitoringService.get(attemptId);
        setDetail(response.data);
      } catch (error) {
        toast.error("Gagal memuat detail monitoring");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [attemptId]);

  const formatTime = (iso: string | null) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "medium",
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} menit ${secs} detik`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Data tidak ditemukan</div>
      </div>
    );
  }

  const { attempt, event_summary, event_timeline } = detail;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/guru/exams/monitoring")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Detail Monitoring Attempt</h1>
          <p className="text-gray-600">
            {attempt.student.name} - {attempt.exam.title}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Informasi Siswa</h3>
          <div className="space-y-2 text-sm">
            <div>
              <div className="text-gray-500">Nama</div>
              <div className="font-medium">{attempt.student.name}</div>
            </div>
            <div>
              <div className="text-gray-500">NIS</div>
              <div className="font-medium">{attempt.student.nis}</div>
            </div>
            <div>
              <div className="text-gray-500">No. Kartu Ujian</div>
              <div className="font-medium">{attempt.participant.exam_card_number}</div>
            </div>
            {attempt.participant.is_blocked && (
              <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center gap-2 text-red-800 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Akses Diblokir</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Status Attempt</h3>
          <div className="space-y-2 text-sm">
            <div>
              <div className="text-gray-500">Attempt Ke-</div>
              <div className="font-medium">#{attempt.attempt_number}</div>
            </div>
            <div>
              <div className="text-gray-500">Status</div>
              <div className="mt-1">
                <Badge className={statusColors[attempt.status]}>
                  {statusLabels[attempt.status]}
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-gray-500">Mulai</div>
              <div className="font-medium">{formatTime(attempt.started_at)}</div>
            </div>
            <div>
              <div className="text-gray-500">Berakhir</div>
              <div className="font-medium">{formatTime(attempt.expires_at)}</div>
            </div>
            {attempt.submitted_at && (
              <div>
                <div className="text-gray-500">Submitted</div>
                <div className="font-medium">{formatTime(attempt.submitted_at)}</div>
              </div>
            )}
            {attempt.status === "active" && attempt.remaining_seconds !== null && (
              <div>
                <div className="text-gray-500">Sisa Waktu</div>
                <div className="font-medium text-blue-600">
                  {formatDuration(attempt.remaining_seconds)}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Progress Jawaban</h3>
          <div className="space-y-2 text-sm">
            <div>
              <div className="text-gray-500">Total Soal</div>
              <div className="font-medium">{attempt.progress.total_questions}</div>
            </div>
            <div>
              <div className="text-gray-500">Terjawab</div>
              <div className="font-medium text-green-600">{attempt.progress.answered}</div>
            </div>
            <div>
              <div className="text-gray-500">Belum Dijawab</div>
              <div className="font-medium text-gray-600">{attempt.progress.unanswered}</div>
            </div>
            <div className="pt-2">
              <div className="text-gray-500 mb-1">Persentase</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${attempt.progress.percentage}%` }}
                />
              </div>
              <div className="text-center mt-1 font-medium">
                {attempt.progress.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Security Events Summary</h3>
        {Object.keys(event_summary).length === 0 ? (
          <p className="text-gray-500 text-sm">Tidak ada security event tercatat.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(event_summary).map(([eventType, count]) => (
              <div key={eventType} className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  {eventTypeLabels[eventType] || eventType}
                </div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Activity Timeline</h3>
        {event_timeline.length === 0 ? (
          <p className="text-gray-500 text-sm">Tidak ada aktivitas tercatat.</p>
        ) : (
          <div className="space-y-3">
            {event_timeline.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-32 text-sm text-gray-600">
                  {formatTime(event.occurred_at)}
                </div>
                <div className="flex-1">
                  <Badge variant="secondary" className="text-xs">
                    {eventTypeLabels[event.event_type] || event.event_type}
                  </Badge>
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="mt-1 text-xs text-gray-500">
                      {JSON.stringify(event.metadata)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
