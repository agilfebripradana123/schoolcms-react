import { useCallback, useEffect, useState } from "react";
import { ChevronDown, FileQuestion } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import PortalErrorState from "@/portal/components/PortalErrorState";
import { examReportService } from "../../api/exam-report.service";
import type { ExamReportScope } from "../../api/exam-report.service";
import { toApiError } from "@/lib/api";
import type {
  ExamEssayAggregate,
  ExamReportData,
  ExamReportQuestion,
} from "../../api/types";

const TYPE_LABEL: Record<string, string> = {
  multiple_choice: "Pilihan Ganda",
  true_false: "Benar/Salah",
  essay: "Esai",
};

const TYPE_BADGE: Record<string, "primary" | "secondary" | "neutral"> = {
  multiple_choice: "primary",
  true_false: "secondary",
  essay: "neutral",
};

function formatPct(value: number | null): string {
  if (value === null) return "-";
  return `${value.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%`;
}

interface StatProps {
  label: string;
  value: string | number;
  hint?: string;
}

function StatCard({ label, value, hint }: StatProps) {
  return (
    <div className="rounded-xl bg-surface-container p-3">
      <p className="text-xs text-on-surface-variant">{label}</p>
      <p className="mt-1 text-lg font-bold text-on-surface">{value}</p>
      {hint && <p className="text-[11px] text-outline">{hint}</p>}
    </div>
  );
}

function OptionDistribution({ row }: { row: ExamReportQuestion }) {
  if (row.type === "essay" || row.option_distribution.length === 0) {
    return <span className="text-xs text-outline">-</span>;
  }
  const max = Math.max(...row.option_distribution.map((o) => o.selected_count), 1);
  return (
    <details className="group">
      <summary className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-on-surface hover:text-primary">
        Distribusi
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-2 space-y-2">
        {row.option_distribution.map((option) => {
          const pct = row.attempts_total > 0 ? (option.selected_count / row.attempts_total) * 100 : 0;
          return (
            <div key={option.option_id}>
              <div className="flex items-center justify-between gap-2 text-xs text-on-surface-variant">
                <span className="truncate">{option.option_text}</span>
                <span className="shrink-0">
                  {option.selected_count} · {pct.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%
                </span>
              </div>
              <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className="h-full rounded-full bg-primary-container"
                  style={{ width: `${(option.selected_count / max) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </details>
  );
}

function QuestionCard({ row }: { row: ExamReportQuestion }) {
  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-on-surface">Soal {row.position}</p>
        <Badge variant={TYPE_BADGE[row.type] ?? "neutral"}>
          {TYPE_LABEL[row.type] ?? row.type}
        </Badge>
      </div>
      <p className="mt-1 line-clamp-3 text-sm text-on-surface" title={row.question_text}>
        {row.question_text}
      </p>
      <p className="mt-1 text-xs text-on-surface-variant">Bobot: {row.points}</p>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-on-surface-variant">
        <span>Percobaan: {row.attempts_total}</span>
        <span>Terjawab: {row.answered}</span>
        <span>Tidak terjawab: {row.unanswered}</span>
        {row.type === "essay" ? (
          <>
            <span>Menunggu dinilai: {row.essay?.pending_manual ?? 0}</span>
            <span>Sudah dinilai: {row.essay?.manually_graded ?? 0}</span>
            <span>Rata-rata skor: {row.essay?.average_score != null ? row.essay.average_score : "-"}</span>
          </>
        ) : (
          <>
            <span>Benar: {row.correct ?? "-"}</span>
            <span>Salah: {row.incorrect ?? "-"}</span>
            <span>Persentase benar: {formatPct(row.correctness_percentage)}</span>
          </>
        )}
      </div>
      <div className="mt-2 border-t border-outline-variant pt-2">
        <OptionDistribution row={row} />
      </div>
    </div>
  );
}

interface ExamReportViewProps {
  examId: number;
  scope: ExamReportScope;
}

/**
 * Reusable read-only examination report (B15 aggregates).
 *
 * Summary uses the effective-result population; question analysis is
 * attempt-history based (may include in-progress attempts) and is labeled as
 * such. Never displays answer keys, correct-option identity, or explanations.
 */
export default function ExamReportView({ examId, scope }: ExamReportViewProps) {
  const [summary, setSummary] = useState<ExamReportData | null>(null);
  const [questions, setQuestions] = useState<ExamReportQuestion[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      examReportService.summary(examId, scope),
      examReportService.questions(examId, scope),
    ])
      .then(([summaryRes, questionsRes]) => {
        setSummary(summaryRes.data);
        setQuestions(questionsRes.data.questions ?? []);
      })
      .catch((err) => setError(toApiError(err).message))
      .finally(() => setLoading(false));
  }, [examId, scope]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Card>
        <div className="p-6 text-center text-sm text-outline">Memuat laporan ujian...</div>
      </Card>
    );
  }

  if (error) {
    return <PortalErrorState message={error} onRetry={load} />;
  }

  const s = summary?.summary;

  const essaySummaryCells = (essay: ExamEssayAggregate | null) => (
    <>
      <p>Menunggu dinilai: {essay?.pending_manual ?? 0}</p>
      <p>Sudah dinilai: {essay?.manually_graded ?? 0}</p>
      <p>Rata-rata skor: {essay?.average_score != null ? essay.average_score : "-"}</p>
    </>
  );

  const columns = [
    {
      header: "No",
      accessor: "position" as keyof ExamReportQuestion,
      className: "px-6 py-4 text-center text-sm text-on-surface-variant",
      render: (_value: unknown, row: ExamReportQuestion) => <span>{row.position}</span>,
    },
    {
      header: "Pertanyaan",
      accessor: "question_text" as keyof ExamReportQuestion,
      render: (_value: unknown, row: ExamReportQuestion) => (
        <span className="line-clamp-2 max-w-[300px] text-sm text-on-surface" title={row.question_text}>
          {row.question_text}
        </span>
      ),
    },
    {
      header: "Tipe",
      accessor: "type" as keyof ExamReportQuestion,
      className: "px-6 py-4 text-center text-sm text-on-surface",
      render: (_value: unknown, row: ExamReportQuestion) => (
        <Badge variant={TYPE_BADGE[row.type] ?? "neutral"}>
          {TYPE_LABEL[row.type] ?? row.type}
        </Badge>
      ),
    },
    {
      header: "Bobot",
      accessor: "points" as keyof ExamReportQuestion,
      className: "px-6 py-4 text-center text-sm text-on-surface",
      render: (_value: unknown, row: ExamReportQuestion) => <span>{row.points}</span>,
    },
    {
      header: "Percobaan",
      accessor: "attempts_total" as keyof ExamReportQuestion,
      className: "px-6 py-4 text-center text-sm text-on-surface",
      render: (_value: unknown, row: ExamReportQuestion) => <span>{row.attempts_total}</span>,
    },
    {
      header: "Terjawab",
      accessor: "answered" as keyof ExamReportQuestion,
      className: "px-6 py-4 text-center text-sm text-on-surface",
      render: (_value: unknown, row: ExamReportQuestion) => <span>{row.answered}</span>,
    },
    {
      header: "Tidak Terjawab",
      accessor: "unanswered" as keyof ExamReportQuestion,
      className: "px-6 py-4 text-center text-sm text-on-surface",
      render: (_value: unknown, row: ExamReportQuestion) => <span>{row.unanswered}</span>,
    },
    {
      header: "Benar",
      accessor: "correct" as keyof ExamReportQuestion,
      className: "px-6 py-4 text-center text-sm text-on-surface",
      render: (_value: unknown, row: ExamReportQuestion) =>
        row.type === "essay" ? <span>-</span> : <span>{row.correct ?? "-"}</span>,
    },
    {
      header: "Salah",
      accessor: "incorrect" as keyof ExamReportQuestion,
      className: "px-6 py-4 text-center text-sm text-on-surface",
      render: (_value: unknown, row: ExamReportQuestion) =>
        row.type === "essay" ? <span>-</span> : <span>{row.incorrect ?? "-"}</span>,
    },
    {
      header: "Persentase Benar",
      accessor: "correctness_percentage" as keyof ExamReportQuestion,
      className: "px-6 py-4 text-center text-sm text-on-surface",
      render: (_value: unknown, row: ExamReportQuestion) =>
        row.type === "essay" ? (
          <div className="text-left text-xs text-on-surface-variant">{essaySummaryCells(row.essay)}</div>
        ) : (
          <span>{formatPct(row.correctness_percentage)}</span>
        ),
    },
    {
      header: "Distribusi Opsi",
      accessor: "option_distribution" as keyof ExamReportQuestion,
      className: "px-6 py-4 text-sm text-on-surface",
      render: (_value: unknown, row: ExamReportQuestion) => (
        <OptionDistribution row={row} />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-semibold text-on-surface">Ringkasan Ujian</h3>
        <p className="mb-4 text-xs text-outline">
          Nilai efektif dihitung dari percobaan terakhir yang dikumpulkan per peserta.
          Total percobaan dapat mencakup percobaan yang masih berjalan.
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          <StatCard label="Peserta" value={s?.participant_count ?? 0} />
          <StatCard
            label="Total Percobaan"
            value={s?.attempt_count ?? 0}
            hint="Termasuk percobaan berjalan"
          />
          <StatCard label="Percobaan Dikumpulkan" value={s?.submitted_attempt_count ?? 0} />
          <StatCard label="Percobaan Efektif" value={s?.effective_attempt_count ?? 0} />
          <StatCard label="Belum Selesai" value={s?.incomplete_attempt_count ?? 0} />
          <StatCard label="Rata-rata Nilai Efektif" value={formatPct(s?.average_percentage ?? null)} />
          <StatCard label="Nilai Efektif Terendah" value={formatPct(s?.minimum_percentage ?? null)} />
          <StatCard label="Nilai Efektif Tertinggi" value={formatPct(s?.maximum_percentage ?? null)} />
        </div>
      </Card>

      <Card>
        <h3 className="mb-1 font-semibold text-on-surface">Analisis Percobaan per Soal</h3>
        <p className="mb-4 text-xs text-outline">
          Berbasis percobaan yang mencakup soal ini dan dapat memasukkan percobaan yang masih
          berjalan. Bukan ringkasan nilai efektif.
        </p>
        {questions === null ? (
          <div className="py-8 text-center text-sm text-outline">Belum ada data soal.</div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <FileQuestion className="h-8 w-8 text-outline" />
            <p className="text-sm text-outline">Belum ada analisis soal untuk ujian ini.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:hidden">
              {questions.map((row) => (
                <QuestionCard key={row.question_id} row={row} />
              ))}
            </div>
            <div className="hidden sm:block">
              <DataTable
                columns={columns}
                data={questions}
                emptyMessage="Belum ada analisis soal."
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}