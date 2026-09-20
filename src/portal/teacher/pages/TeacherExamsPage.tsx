import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Search from "@/components/ui/Search";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PortalErrorState from "@/portal/components/PortalErrorState";
import Pagination from "../../../components/ui/Pagination";
import { myExamService } from "@/features/examinations";
import type { Exam, ExamStatus } from "@/features/examinations/api/types";
import ExamReportView from "@/features/examinations/components/report/ExamReportView";
import { usePermission } from "@/features/auth/usePermission";
import { toApiError } from "@/lib/api";
import type { SelectOption } from "@/components/ui/Select";

const STATUS_LABELS: Record<ExamStatus, string> = {
  draft: "Draf",
  published: "Terbit",
  ongoing: "Berlangsung",
  completed: "Selesai",
  archived: "Arsip",
};

const STATUS_VARIANTS: Record<ExamStatus, "neutral" | "primary" | "success" | "warning" | "secondary"> = {
  draft: "neutral",
  published: "primary",
  ongoing: "warning",
  completed: "success",
  archived: "secondary",
};

export default function TeacherExamsPage() {
  const { can } = usePermission();
  const canViewExamResults = can("view-exam-results");

  const [exams, setExams] = useState<Exam[]>([]);
  const [meta, setMeta] = useState<{ total: number; last_page: number; current_page: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [status, setStatus] = useState<ExamStatus | null>(null);
  const [page, setPage] = useState(1);

  const [subjectOptions, setSubjectOptions] = useState<SelectOption<number>[]>([]);

  const searchTimeout = useRef<number | null>(null);

  const load = useCallback(
    (pageNum: number, q: string, subject: number | null, st: ExamStatus | null) => {
      setLoading(true);
      setError(null);
      myExamService
        .list({
          page: pageNum,
          per_page: 15,
          search: q || undefined,
          subject_id: subject ?? undefined,
          status: st ?? undefined,
        })
        .then((res) => {
          setExams(res.data ?? []);
          setMeta(res.meta ?? null);
          setSubjectOptions((prev) => {
            const seen = new Map<number, string>(prev.map((o) => [o.value, o.label]));
            for (const e of res.data ?? []) {
              if (e.subject_id != null) {
                seen.set(e.subject_id, e.subject?.name ?? `Mapel ${e.subject_id}`);
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
    load(page, search, subjectId, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    searchTimeout.current = window.setTimeout(() => {
      setPage(1);
      load(1, value, subjectId, status);
    }, 400);
  }, [load, subjectId, status]);

  const handleSubjectChange = useCallback((value: number | null) => {
    setSubjectId(value);
    setPage(1);
    load(1, search, value, status);
  }, [load, search, status]);

  const handleStatusChange = useCallback((value: ExamStatus | null) => {
    setStatus(value);
    setPage(1);
    load(1, search, subjectId, value);
  }, [load, search, subjectId]);

  const statusOptions = useMemo<SelectOption<ExamStatus>[]>(
    () =>
      (Object.keys(STATUS_LABELS) as ExamStatus[]).map((s) => ({
        value: s,
        label: STATUS_LABELS[s],
      })),
    [],
  );

  const [detail, setDetail] = useState<Exam | null>(null);

  return (
    <PageContainer>
      <PageHeader
        title="Ujian"
        description="Ujian pada mata pelajaran yang menjadi scope mengajar Anda."
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari judul..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Mapel</span>
              <Select<number> options={subjectOptions} value={subjectId} onChange={handleSubjectChange} placeholder="Semua mapel" isClearable isSearchable={false} className="min-w-[180px]" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Status</span>
              <Select<ExamStatus> options={statusOptions} value={status} onChange={handleStatusChange} placeholder="Semua status" isClearable isSearchable={false} className="min-w-[180px]" />
            </label>
          </div>
        </div>

        {error ? (
          <PortalErrorState message={error} />
        ) : (
          <DataTable<Exam>
            loading={loading}
            emptyMessage="Belum ada ujian pada scope mengajar Anda."
            columns={[
              { header: "No", accessor: "id", render: (_v, row) => exams.findIndex((e) => e.id === row.id) + 1 },
              {
                header: "Judul",
                accessor: "title",
                render: (v, row) => (
                  <button
                    type="button"
                    onClick={() => setDetail(row)}
                    className="font-semibold text-primary hover:underline"
                  >
                    {String(v ?? "-")}
                  </button>
                ),
              },
              { header: "Mata Pelajaran", accessor: "id", render: (_v, row) => row.subject?.name ?? "-" },
              { header: "Durasi", accessor: "duration_minutes", render: (v) => `${String(v ?? "-")} menit` },
              { header: "Soal", accessor: "total_questions", render: (v) => String(v ?? "-") },
              { header: "KKM", accessor: "passing_score", render: (v) => String(v ?? "-") },
              {
                header: "Status",
                accessor: "status",
                render: (v) => {
                  const st = v as ExamStatus;
                  return <Badge variant={STATUS_VARIANTS[st] ?? "neutral"}>{STATUS_LABELS[st] ?? String(v)}</Badge>;
                },
              },
            ]}
            data={exams}
          />
        )}
        {meta && !error && (
          <div className="mt-4">
            <Pagination
              meta={{ current_page: meta.current_page, last_page: meta.last_page, per_page: 15, total: meta.total }}
              onPageChange={(n) => { setPage(n); load(n, search, subjectId, status); }}
              loading={loading}
              error={error}
            />
          </div>
        )}
      </Card>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Detail Ujian"
        size="lg"
        footer={
          <Button variant="ghost" onClick={() => setDetail(null)}>
            Tutup
          </Button>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-primary">{detail.title}</h3>
              <p className="mt-1 text-sm text-secondary">{detail.subject?.name ?? "-"}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-surface-container p-3">
                <p className="text-xs text-secondary">Durasi</p>
                <p className="mt-1 text-sm font-semibold text-primary">{detail.duration_minutes} menit</p>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <p className="text-xs text-secondary">Jumlah Soal</p>
                <p className="mt-1 text-sm font-semibold text-primary">{detail.total_questions}</p>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <p className="text-xs text-secondary">Maks. Percobaan</p>
                <p className="mt-1 text-sm font-semibold text-primary">{detail.max_attempts}</p>
              </div>
            </div>
            {detail.description && (
              <p className="text-sm text-secondary">{detail.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant={STATUS_VARIANTS[detail.status] ?? "neutral"}>{STATUS_LABELS[detail.status]}</Badge>
              <Badge variant="neutral">Acak soal: {detail.shuffle_questions ? "Ya" : "Tidak"}</Badge>
              <Badge variant="neutral">Acak opsi: {detail.shuffle_options ? "Ya" : "Tidak"}</Badge>
              <Badge variant="neutral">Tampilkan hasil: {detail.show_result ? "Ya" : "Tidak"}</Badge>
            </div>
            <div className="border-t border-outline-variant pt-4">
              {canViewExamResults ? (
                <ExamReportView examId={detail.id} scope="teacher" />
              ) : (
                <p className="rounded-xl bg-surface-container px-4 py-3 text-xs text-secondary">
                  Anda tidak memiliki izin untuk melihat laporan ujian.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
