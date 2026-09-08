import { useCallback, useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import PortalFilterBar from "@/portal/components/PortalFilterBar";
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
    <PageContainer>
      <PageHeader
        title="Hasil Ujian"
        description="Hasil ujian siswa pada kelas & mata pelajaran yang menjadi scope mengajar Anda."
      />

      <PortalFilterBar className="mb-6">
          <BarChart3 className="h-4 w-4 text-slate-500" />
          <label className="text-sm font-medium text-slate-700">Ujian:</label>
          <div className="min-w-[200px]">
            <Select<number> options={examOptions} value={examId} onChange={setExamId} placeholder="Semua ujian" isClearable />
          </div>
          <label className="text-sm font-medium text-slate-700">Status:</label>
          <div className="min-w-[180px]">
            <Select<ExamResultStatus> options={statusOptions()} value={status} onChange={setStatus} placeholder="Semua status" isClearable />
          </div>
          <Button onClick={applyFilters} disabled={loading}>
            Tampilkan
          </Button>
      </PortalFilterBar>

      {error ? (
        <PortalErrorState message={error} />
      ) : results.length === 0 && !loading ? (
        <PortalEmptyState icon={<BarChart3 className="h-10 w-10" />} description="Belum ada hasil ujian pada scope mengajar Anda." />
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
                  className="text-left font-semibold text-indigo-600 hover:underline"
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
      {meta && !error && (
        <div className="mt-4">
          <Pagination
            meta={{ current_page: meta.current_page, last_page: meta.last_page, per_page: (meta as { per_page?: number }).per_page ?? 15, total: meta.total }}
            onPageChange={(n) => { setPage(n); load(n, examId, status); }}
            loading={loading}
            error={error}
          />
        </div>
      )}

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
              <h3 className="text-lg font-bold text-slate-900">{detail.participant?.student?.name ?? "-"}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {detail.participant?.exam?.title ?? "-"} · {detail.participant?.exam?.subject?.name ?? "-"}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Skor</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{detail.total_score}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Nilai Huruf</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{detail.grade ?? "-"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Status</p>
                <p className="mt-1">
                  <Badge variant={STATUS_VARIANTS[detail.status] ?? "neutral"}>{STATUS_LABELS[detail.status]}</Badge>
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Benar</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{detail.correct_count}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Salah</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{detail.wrong_count}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Tidak Dijawab</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{detail.unanswered_count}</p>
              </div>
            </div>
            {detail.graded_at && (
              <p className="text-xs text-slate-500">
                Dinilai pada {String(detail.graded_at)}
              </p>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
