import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  myExamMonitoringService,
  type ExamAttemptDetail,
  type ExamAttemptStatus,
} from "@/features/examinations";
import Card, { CardBody } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

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
      <PageContainer>
        <PageHeader title="Detail Monitoring Attempt" description="Memuat..." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (!detail) {
    return (
      <PageContainer>
        <PageHeader title="Detail Monitoring Attempt" description="" />
        <PortalEmptyState icon={<AlertTriangle className="h-10 w-10" />} description="Data tidak ditemukan" />
      </PageContainer>
    );
  }

  const { attempt, event_summary, event_timeline } = detail;

  return (
    <PageContainer>
      <PageHeader
        title="Detail Monitoring Attempt"
        description={`${attempt.student.name} - ${attempt.exam.title}`}
        actions={
          <Button variant="ghost" onClick={() => navigate("/guru/exams/monitoring")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-6">
        <Card>
          <CardBody>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Informasi Siswa
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nama</div>
              <div className="mt-0.5 font-medium text-slate-900">{attempt.student.name}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">NIS</div>
              <div className="mt-0.5 font-medium text-slate-900">{attempt.student.nis}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">No. Kartu Ujian</div>
              <div className="mt-0.5 font-medium text-slate-900">{attempt.participant.exam_card_number}</div>
            </div>
            {attempt.participant.is_blocked && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span>Akses Diblokir</span>
              </div>
            )}
          </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Status Attempt
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Attempt Ke-</div>
              <div className="mt-0.5 font-medium text-slate-900">#{attempt.attempt_number}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</div>
              <div className="mt-1">
                <Badge variant={statusVariants[attempt.status]}>
                  {statusLabels[attempt.status]}
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mulai</div>
              <div className="mt-0.5 font-medium text-slate-900">{formatTime(attempt.started_at)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Berakhir</div>
              <div className="mt-0.5 font-medium text-slate-900">{formatTime(attempt.expires_at)}</div>
            </div>
            {attempt.submitted_at && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted</div>
                <div className="mt-0.5 font-medium text-slate-900">{formatTime(attempt.submitted_at)}</div>
              </div>
            )}
            {attempt.status === "active" && attempt.remaining_seconds !== null && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sisa Waktu</div>
                <div className="mt-0.5 font-medium text-indigo-600">
                  {formatDuration(attempt.remaining_seconds)}
                </div>
              </div>
            )}
          </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Progress Jawaban
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Soal</div>
              <div className="mt-0.5 font-medium text-slate-900">{attempt.progress.total_questions}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Terjawab</div>
              <div className="mt-0.5 font-medium text-indigo-600">{attempt.progress.answered}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Belum Dijawab</div>
              <div className="mt-0.5 font-medium text-slate-900">{attempt.progress.unanswered}</div>
            </div>
            <div className="pt-2">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Persentase</div>
              <div className="h-2 w-full rounded-full bg-slate-50">
                <div
                  className="h-2 rounded-full bg-indigo-600"
                  style={{ width: `${attempt.progress.percentage}%` }}
                />
              </div>
              <div className="mt-1 text-center font-semibold text-slate-900">
                {attempt.progress.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-3 mb-6">
        <Card>
        <CardBody>
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          Security Events Summary
        </h3>
        {Object.keys(event_summary).length === 0 ? (
          <p className="text-sm text-slate-500">Tidak ada security event tercatat.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Object.entries(event_summary).map(([eventType, count]) => (
              <div key={eventType} className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm text-slate-500">
                  {eventTypeLabels[eventType] || eventType}
                </div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{count}</div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
      </Card>

      <Card>
        <CardBody>
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          Activity Timeline
        </h3>
        {event_timeline.length === 0 ? (
          <p className="text-sm text-slate-500">Tidak ada aktivitas tercatat.</p>
        ) : (
          <div className="space-y-3">
            {event_timeline.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4"
              >
                <div className="w-32 shrink-0 text-sm text-slate-500">
                  {formatTime(event.occurred_at)}
                </div>
                <div className="min-w-0 flex-1">
                  <Badge variant="secondary" className="text-xs">
                    {eventTypeLabels[event.event_type] || event.event_type}
                  </Badge>
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="mt-1 text-xs text-slate-500">
                      {JSON.stringify(event.metadata)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
      </Card>
      </div>
    </PageContainer>
  );
}
