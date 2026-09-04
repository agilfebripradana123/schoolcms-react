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
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
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
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <p className="text-sm text-on-surface-variant">Data tidak ditemukan</p>
      </div>
    );
  }

  const { attempt, event_summary, event_timeline } = detail;

  return (
    <PageContainer className="py-6">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <h3 className="mb-4 font-display text-base font-semibold text-on-surface">
            Informasi Siswa
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-outline">Nama</div>
              <div className="mt-0.5 font-medium text-on-surface">{attempt.student.name}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-outline">NIS</div>
              <div className="mt-0.5 font-medium text-on-surface">{attempt.student.nis}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-outline">No. Kartu Ujian</div>
              <div className="mt-0.5 font-medium text-on-surface">{attempt.participant.exam_card_number}</div>
            </div>
            {attempt.participant.is_blocked && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-error-container px-3 py-2 text-sm text-error">
                <AlertTriangle className="h-4 w-4" />
                <span>Akses Diblokir</span>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-display text-base font-semibold text-on-surface">
            Status Attempt
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-outline">Attempt Ke-</div>
              <div className="mt-0.5 font-medium text-on-surface">#{attempt.attempt_number}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-outline">Status</div>
              <div className="mt-1">
                <Badge variant={statusVariants[attempt.status]}>
                  {statusLabels[attempt.status]}
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-outline">Mulai</div>
              <div className="mt-0.5 font-medium text-on-surface">{formatTime(attempt.started_at)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-outline">Berakhir</div>
              <div className="mt-0.5 font-medium text-on-surface">{formatTime(attempt.expires_at)}</div>
            </div>
            {attempt.submitted_at && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-outline">Submitted</div>
                <div className="mt-0.5 font-medium text-on-surface">{formatTime(attempt.submitted_at)}</div>
              </div>
            )}
            {attempt.status === "active" && attempt.remaining_seconds !== null && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-outline">Sisa Waktu</div>
                <div className="mt-0.5 font-medium text-primary">
                  {formatDuration(attempt.remaining_seconds)}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-display text-base font-semibold text-on-surface">
            Progress Jawaban
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-outline">Total Soal</div>
              <div className="mt-0.5 font-medium text-on-surface">{attempt.progress.total_questions}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-outline">Terjawab</div>
              <div className="mt-0.5 font-medium text-tertiary">{attempt.progress.answered}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-outline">Belum Dijawab</div>
              <div className="mt-0.5 font-medium text-on-surface">{attempt.progress.unanswered}</div>
            </div>
            <div className="pt-2">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-outline">Persentase</div>
              <div className="h-2 w-full rounded-full bg-surface-container-high">
                <div
                  className="h-2 rounded-full bg-primary-container"
                  style={{ width: `${attempt.progress.percentage}%` }}
                />
              </div>
              <div className="mt-1 text-center font-semibold text-on-surface">
                {attempt.progress.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
        <h3 className="mb-4 font-display text-base font-semibold text-on-surface">
          Security Events Summary
        </h3>
        {Object.keys(event_summary).length === 0 ? (
          <p className="text-sm text-on-surface-variant">Tidak ada security event tercatat.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Object.entries(event_summary).map(([eventType, count]) => (
              <div key={eventType} className="rounded-2xl bg-surface-container-low p-4">
                <div className="text-sm text-on-surface-variant">
                  {eventTypeLabels[eventType] || eventType}
                </div>
                <div className="mt-1 text-2xl font-bold text-on-surface">{count}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-4 font-display text-base font-semibold text-on-surface">
          Activity Timeline
        </h3>
        {event_timeline.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Tidak ada aktivitas tercatat.</p>
        ) : (
          <div className="space-y-3">
            {event_timeline.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-4 rounded-2xl bg-surface-container-low p-4"
              >
                <div className="w-32 shrink-0 text-sm text-on-surface-variant">
                  {formatTime(event.occurred_at)}
                </div>
                <div className="min-w-0 flex-1">
                  <Badge variant="secondary" className="text-xs">
                    {eventTypeLabels[event.event_type] || event.event_type}
                  </Badge>
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="mt-1 text-xs text-on-surface-variant">
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
    </PageContainer>
  );
}
