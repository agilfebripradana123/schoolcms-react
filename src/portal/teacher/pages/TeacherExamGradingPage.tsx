import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardPenLine, FileQuestion } from "lucide-react";
import { toast } from "sonner";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card, { CardBody } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Form";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import { teacherExamGradingService } from "@/features/examinations";
import { toApiError } from "@/lib/api";
import { usePermission } from "@/features/auth/usePermission";
import type {
  GradeResultSummary,
  TeacherEssayGradingData,
  TeacherEssayItem,
} from "@/features/examinations/api/types";

const GRADE_STATUS_LABEL: Record<string, string> = {
  manually_graded: "Dinilai",
  pending_manual: "Belum Dinilai",
  auto: "Otomatis",
};

const GRADE_STATUS_VARIANT: Record<string, "success" | "neutral" | "secondary"> = {
  manually_graded: "success",
  pending_manual: "neutral",
  auto: "secondary",
};

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("id-ID");
}

export default function TeacherExamGradingPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { can } = usePermission();
  const canManageExamResults = can("manage-exam-results");

  const [data, setData] = useState<TeacherEssayGradingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [scores, setScores] = useState<Record<number, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [resultSummary, setResultSummary] = useState<GradeResultSummary | null>(null);
  const [finalizedLocked, setFinalizedLocked] = useState(false);

  const fetchData = useCallback(() => {
    if (!attemptId) return;
    setLoading(true);
    setError(null);

    teacherExamGradingService
      .getAttempt(attemptId)
      .then((res) => {
        setData(res.data);
        setScores(
          Object.fromEntries(
            res.data.essays.map((e) => [e.exam_answer_id, e.score != null ? String(e.score) : ""]),
          ),
        );
        setFeedbacks(
          Object.fromEntries(
            res.data.essays.map((e) => [e.exam_answer_id, e.feedback ?? ""]),
          ),
        );
        setResultSummary(null);
      })
      .catch((err) => setError(toApiError(err).message))
      .finally(() => setLoading(false));
  }, [attemptId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const progress = useMemo(() => {
    const essays = data?.essays ?? [];
    const graded = essays.filter((e) => e.grade_status === "manually_graded").length;
    const pending = essays.length - graded;
    let statusLabel = "Belum Dinilai";
    if (essays.length > 0 && graded === essays.length) statusLabel = "Selesai";
    else if (graded > 0) statusLabel = "Sebagian";
    return { total: essays.length, graded, pending, statusLabel };
  }, [data]);

  const isActiveAttempt = data?.attempt_status === "active";

  const handleSave = async (item: TeacherEssayItem) => {
    if (savingId !== null || !canManageExamResults || finalizedLocked) return;
    const raw = (scores[item.exam_answer_id] ?? "").trim();
    const value = Number(raw);

    if (raw === "" || !Number.isInteger(value)) {
      toast.error("Skor harus berupa bilangan bulat.");
      return;
    }
    if (value < 0 || value > item.max_points) {
      toast.error(`Skor harus antara 0 dan ${item.max_points}.`);
      return;
    }

    const feedback = (feedbacks[item.exam_answer_id] ?? "").trim() || null;
    setSavingId(item.exam_answer_id);

    try {
      const res = await teacherExamGradingService.gradeEssay(item.exam_answer_id, {
        score: value,
        feedback,
      });
      setResultSummary(res.data.result);
      setData((prev) =>
        prev
          ? {
              ...prev,
              essays: prev.essays.map((e) =>
                e.exam_answer_id === item.exam_answer_id
                  ? {
                      ...e,
                      score: res.data.score,
                      feedback: res.data.feedback,
                      grade_status: res.data.grade_status,
                      graded_at: res.data.graded_at,
                    }
                  : e,
              ),
            }
          : prev,
      );
      toast.success("Skor esai berhasil disimpan.");
    } catch (err) {
      const apiError = toApiError(err);
      toast.error("Gagal menyimpan skor", { description: apiError.message });
      if (apiError.message.toLowerCase().includes("finalized")) {
        setFinalizedLocked(true);
      }
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Penilaian Essay" description="Memuat..." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Penilaian Essay" description="" actions={
          <Button variant="ghost" onClick={() => navigate("/guru/exams/monitoring")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        } />
        <PortalErrorState message={error} onRetry={fetchData} />
      </PageContainer>
    );
  }

  if (!data || data.essays.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Penilaian Essay" description="" actions={
          <Button variant="ghost" onClick={() => navigate("/guru/exams/monitoring")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        } />
        <PortalEmptyState
          icon={<FileQuestion className="h-10 w-10" />}
          description="Tidak ada jawaban esai pada attempt ini."
          action={
            <Button variant="secondary" onClick={() => navigate("/guru/exams/monitoring")}>
              Kembali ke Monitoring
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const student = data.essays[0]?.student;

  return (
    <PageContainer>
      <PageHeader
        title="Penilaian Essay"
        description={`${student?.name ?? "-"} (${student?.nis ?? "-"}) — Attempt #${data.attempt_id}`}
        actions={
          <Button variant="ghost" onClick={() => navigate("/guru/exams/monitoring")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Status Attempt</p>
            <Badge
              variant={data.attempt_status === "submitted" ? "success" : data.attempt_status === "expired" ? "danger" : "primary"}
              className="mt-1"
            >
              {data.attempt_status === "submitted"
                ? "Selesai"
                : data.attempt_status === "expired"
                  ? "Waktu Habis"
                  : "Sedang Mengerjakan"}
            </Badge>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Total Esai</p>
            <p className="mt-1 text-2xl font-bold text-primary">{progress.total}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Sudah Dinilai</p>
            <p className="mt-1 text-2xl font-bold text-primary">{progress.graded}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Progres</p>
            <p className="mt-1 text-2xl font-bold text-primary">{progress.statusLabel}</p>
            {progress.pending > 0 && (
              <p className="text-xs text-secondary">{progress.pending} belum dinilai</p>
            )}
          </CardBody>
        </Card>
      </div>

      {isActiveAttempt && (
        <div className="mb-4 rounded-2xl bg-surface-container p-4 text-sm text-secondary">
          Attempt masih aktif. Penilaian hanya dapat dilakukan setelah attempt selesai atau
          waktu habis.
        </div>
      )}

      {!canManageExamResults && (
        <div className="mb-4 rounded-2xl bg-surface-container p-4 text-sm text-secondary">
          Mode baca saja: Anda tidak memiliki izin <span className="font-semibold">manage-exam-results</span>{" "}
          untuk menilai esai. Nilai yang ada tetap dapat dilihat.
        </div>
      )}

      {finalizedLocked && (
        <div className="mb-4 rounded-2xl bg-error-container px-4 py-3 text-sm text-error">
          Hasil sudah difinalisasi — essay tidak dapat diubah. Hasil tetap dapat dibaca.
        </div>
      )}

      {resultSummary && (
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardPenLine className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-primary">Rekap Hasil (terakhir disimpan)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <div>
                <p className="text-xs text-secondary">Skor</p>
                <p className="font-bold text-primary">{resultSummary.total_score}</p>
              </div>
              <div>
                <p className="text-xs text-secondary">Persentase</p>
                <p className="font-bold text-primary">{resultSummary.percentage}%</p>
              </div>
              <div>
                <p className="text-xs text-secondary">Grade</p>
                <p className="font-bold text-primary">{resultSummary.grade ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-secondary">Benar / Salah</p>
                <p className="font-bold text-primary">
                  {resultSummary.correct_count} / {resultSummary.wrong_count}
                </p>
              </div>
              <div>
                <p className="text-xs text-secondary">Status Result</p>
                <Badge variant={resultSummary.status === "graded" ? "success" : "neutral"} className="mt-1">
                  {resultSummary.status === "graded" ? "Selesai" : "Pending"}
                </Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="space-y-4">
        {data.essays.map((essay, index) => (
          <Card key={essay.exam_answer_id}>
            <CardBody>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                    Esai {index + 1}
                  </p>
                  <p className="mt-1 font-medium text-primary">{essay.question_text}</p>
                </div>
                <Badge variant={GRADE_STATUS_VARIANT[essay.grade_status ?? "pending_manual"] ?? "neutral"}>
                  {essay.grade_status
                    ? (GRADE_STATUS_LABEL[essay.grade_status] ?? essay.grade_status)
                    : "Belum Dinilai"}
                </Badge>
              </div>

              <div className="mb-3 rounded-2xl bg-surface-container p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-secondary">
                  Jawaban Siswa
                </p>
                <p className="whitespace-pre-wrap text-sm text-primary">
                  {essay.essay_answer ?? "-"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-secondary">
                    Skor (0 — {essay.max_points})
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={essay.max_points}
                    step={1}
                    value={scores[essay.exam_answer_id] ?? ""}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [essay.exam_answer_id]: e.target.value,
                      }))
                    }
                    placeholder="0"
                    disabled={
                      isActiveAttempt ||
                      savingId === essay.exam_answer_id ||
                      finalizedLocked ||
                      !canManageExamResults
                    }
                  />
                  <p className="mt-1 text-xs text-secondary">
                    Skor saat ini: {essay.score != null ? `${essay.score} / ${essay.max_points}` : "Belum dinilai"}
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-secondary">
                    Feedback
                  </label>
                  <Textarea
                    value={feedbacks[essay.exam_answer_id] ?? ""}
                    onChange={(e) =>
                      setFeedbacks((prev) => ({
                        ...prev,
                        [essay.exam_answer_id]: e.target.value,
                      }))
                    }
                    placeholder="Catatan untuk siswa (opsional)"
                    rows={2}
                    disabled={
                      isActiveAttempt ||
                      savingId === essay.exam_answer_id ||
                      finalizedLocked ||
                      !canManageExamResults
                    }
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-secondary">
                  Dinilai pada: {formatDate(essay.graded_at)}
                </p>
                {canManageExamResults && !finalizedLocked && (
                  <Button
                    onClick={() => handleSave(essay)}
                    loading={savingId === essay.exam_answer_id}
                    disabled={isActiveAttempt || (savingId !== null && savingId !== essay.exam_answer_id)}
                  >
                    Simpan Skor
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}