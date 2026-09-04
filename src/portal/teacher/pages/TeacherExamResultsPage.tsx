import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Pagination from "../../../components/ui/Pagination";
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
  const [meta, setMeta] = useState<{ total: number; last_page: number; current_page: number; per_page?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [examId, setExamId] = useState<number | null>(null);
  const [status, setStatus] = useState<ExamResultStatus | null>(null);
  const [page, setPage] = useState(1);

  const [examOptions, setExamOptions] = useState<SelectOption<number>[]>([]);

  const load = useCallback(
    (pageNum: number, exam: number | null, st: ExamResultStatus | null) => {
      setLoading(true);
      setError(null);
      const useLargePage = exam != null;
      myExamResultService
        .list({
          page: useLargePage ? 1 : pageNum,
          per_page: useLargePage ? 200 : 15,
          participant_id: undefined,
          status: st ?? undefined,
        })
        .then((res) => {
          let data = res.data ?? [];
          if (exam != null) {
            data = data.filter((r) => r.participant?.exam?.id === exam);
          }
          setResults(data);
          if (useLargePage) {
            setMeta({ current_page: 1, last_page: 1, total: data.length, per_page: data.length });
          } else {
            setMeta(res.meta ?? null);
          }
          setExamOptions((prev) => {
            const seen = new Map<number, string>(prev.map((o) => [o.value, o.label]));
            for (const r of res.data ?? []) {
              const examRef = r.participant?.exam;
              if (examRef?.id != null) {
                seen.set(examRef.id, examRef.title ?? `Ujian ${examRef.id}`);
              }
            }
            return Array.from(seen, ([value, label]) => ({ value, label }));
          });
        })
        .catch((err) => setError(toApiError(err).message))
        .finally(() => setLoading(false));
    },
    [],
  );

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
    <PageContainer className="py-6">
      <PageHeader
        title="Hasil Ujian"
        description="Hasil ujian siswa pada kelas & mata pelajaran yang menjadi scope mengajar Anda."
      />

      <Card>
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Ujian
            </label>
            <Select<number> options={examOptions} value={examId} onChange={setExamId} placeholder="Semua ujian" isClearable />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Status
            </label>
            <Select<ExamResultStatus> options={statusOptions()} value={status} onChange={setStatus} placeholder="Semua status" isClearable />
          </div>
          <div className="flex items-end">
            <Button onClick={applyFilters} disabled={loading} className="w-full">
              Tampilkan
            </Button>
          </div>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">{error}</p>
            <Button variant="secondary" size="sm" onClick={applyFilters}>
              Muat Ulang
            </Button>
          </div>
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
        {meta && (
          <Pagination
            meta={{ current_page: meta.current_page, last_page: meta.last_page, per_page: (meta as { per_page?: number }).per_page ?? 15, total: meta.total }}
            onPageChange={(n) => { setPage(n); load(n, examId, status); }}
            loading={loading}
            error={error}
          />
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
    </PageContainer>
  );
}
