import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { myExamResultService } from "@/features/examinations";
import type { ExamResult, ExamResultStatus } from "@/features/examinations/api/types";
import { toApiError } from "@/lib/api";
import type { SelectOption } from "@/components/ui/Select";

const STATUS_LABELS: Record<ExamResultStatus, string> = {
  pending: "Pending",
  graded: "Dinilai",
};

const STATUS_VARIANTS: Record<ExamResultStatus, "neutral" | "success"> = {
  pending: "neutral",
  graded: "success",
};

export default function TeacherExamResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [meta, setMeta] = useState<{ total: number; last_page: number; current_page: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [examId, setExamId] = useState<number | null>(null);
  const [status, setStatus] = useState<ExamResultStatus | null>(null);
  const [page, setPage] = useState(1);

  const [examOptions, setExamOptions] = useState<SelectOption<number>[]>([]);

  const load = useCallback((pageNum: number, _exam: number | null, st: ExamResultStatus | null) => {
    setLoading(true);
    setError(null);
    myExamResultService
      .list({
        page: pageNum,
        per_page: 15,
        participant_id: undefined,
        status: st ?? undefined,
      })
      .then((res) => {
        setResults(res.data ?? []);
        setMeta(res.meta ?? null);
        setExamOptions((prev) => {
          const seen = new Map<number, string>(prev.map((o) => [o.value, o.label]));
          for (const r of res.data ?? []) {
            const exam = r.participant?.exam;
            if (exam?.id != null) {
              seen.set(exam.id, exam.title ?? `Ujian ${exam.id}`);
            }
          }
          return Array.from(seen, ([value, label]) => ({ value, label }));
        });
      })
      .catch((err) => setError(toApiError(err).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(page, examId, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    setPage(1);
    load(1, examId, status);
  };

  const statusOptions = useCallback<() => SelectOption<ExamResultStatus>[]>(
    () =>
      (Object.keys(STATUS_LABELS) as ExamResultStatus[]).map((s) => ({
        value: s,
        label: STATUS_LABELS[s],
      })),
    [],
  );

  const [detail, setDetail] = useState<ExamResult | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Hasil Ujian</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Hasil ujian siswa pada kelas & mata pelajaran yang menjadi scope mengajar Anda.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Daftar Hasil Ujian"
          description={meta ? `${meta.total} hasil` : undefined}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Select<number> options={examOptions} value={examId} onChange={setExamId} placeholder="Ujian" isClearable className="w-36" />
              <Select<ExamResultStatus> options={statusOptions()} value={status} onChange={setStatus} placeholder="Status" isClearable className="w-32" />
              <Button size="sm" onClick={applyFilters} disabled={loading}>
                Cari
              </Button>
            </div>
          }
        />
        <CardBody>
          {error ? (
            <p className="text-sm text-error">Gagal memuat hasil: {error}</p>
          ) : (
            <DataTable<ExamResult>
              loading={loading}
              emptyMessage="Belum ada hasil ujian pada scope mengajar Anda."
              columns={[
                { header: "No", accessor: "id", render: (_v, row) => results.findIndex((r) => r.id === row.id) + 1 },
                {
                  header: "Siswa",
                  accessor: "id",
                  render: (_v, row) => (
                    <button
                      type="button"
                      onClick={() => setDetail(row)}
                      className="text-left font-semibold text-primary hover:underline"
                    >
                      {row.participant?.student?.name ?? "-"}
                    </button>
                  ),
                },
                { header: "Ujian", accessor: "id", render: (_v, row) => row.participant?.exam?.title ?? "-" },
                { header: "Mapel", accessor: "id", render: (_v, row) => row.participant?.exam?.subject?.name ?? "-" },
                { header: "Skor", accessor: "total_score", render: (v) => String(v ?? "-") },
                { header: "Benar", accessor: "correct_count", render: (v) => String(v ?? "0") },
                { header: "Salah", accessor: "wrong_count", render: (v) => String(v ?? "0") },
                {
                  header: "Status",
                  accessor: "status",
                  render: (v) => {
                    const st = v as ExamResultStatus;
                    return <Badge variant={STATUS_VARIANTS[st] ?? "neutral"}>{STATUS_LABELS[st] ?? String(v)}</Badge>;
                  },
                },
              ]}
              data={results}
            />
          )}
        </CardBody>
        {meta && meta.last_page > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">
              Halaman {meta.current_page} dari {meta.last_page}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1 || loading} onClick={() => { const n = page - 1; setPage(n); load(n, examId, status); }}>
                Sebelumnya
              </Button>
              <Button variant="secondary" size="sm" disabled={page >= (meta.last_page ?? 1) || loading} onClick={() => { const n = page + 1; setPage(n); load(n, examId, status); }}>
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Detail Hasil Ujian"
        footer={
          <Button variant="ghost" onClick={() => setDetail(null)}>
            Tutup
          </Button>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-on-surface">{detail.participant?.student?.name ?? "-"}</h3>
              <p className="mt-1 text-sm text-on-surface-variant">
                {detail.participant?.exam?.title ?? "-"} · {detail.participant?.exam?.subject?.name ?? "-"}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-surface-container-high p-3">
                <p className="text-xs text-on-surface-variant">Skor</p>
                <p className="mt-1 text-lg font-bold text-on-surface">{detail.total_score}</p>
              </div>
              <div className="rounded-xl bg-surface-container-high p-3">
                <p className="text-xs text-on-surface-variant">Nilai Huruf</p>
                <p className="mt-1 text-lg font-bold text-on-surface">{detail.grade ?? "-"}</p>
              </div>
              <div className="rounded-xl bg-surface-container-high p-3">
                <p className="text-xs text-on-surface-variant">Status</p>
                <p className="mt-1">
                  <Badge variant={STATUS_VARIANTS[detail.status] ?? "neutral"}>{STATUS_LABELS[detail.status]}</Badge>
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-surface-container-high p-3">
                <p className="text-xs text-on-surface-variant">Benar</p>
                <p className="mt-1 text-sm font-semibold text-on-surface">{detail.correct_count}</p>
              </div>
              <div className="rounded-xl bg-surface-container-high p-3">
                <p className="text-xs text-on-surface-variant">Salah</p>
                <p className="mt-1 text-sm font-semibold text-on-surface">{detail.wrong_count}</p>
              </div>
              <div className="rounded-xl bg-surface-container-high p-3">
                <p className="text-xs text-on-surface-variant">Tidak Dijawab</p>
                <p className="mt-1 text-sm font-semibold text-on-surface">{detail.unanswered_count}</p>
              </div>
            </div>
            {detail.graded_at && (
              <p className="text-xs text-on-surface-variant">
                Dinilai pada {String(detail.graded_at)}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
