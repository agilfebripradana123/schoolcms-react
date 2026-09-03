import { useCallback, useEffect, useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { myExamService } from "@/features/examinations";
import type { Exam, ExamStatus } from "@/features/examinations/api/types";
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
  const [exams, setExams] = useState<Exam[]>([]);
  const [meta, setMeta] = useState<{ total: number; last_page: number; current_page: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [status, setStatus] = useState<ExamStatus | null>(null);
  const [page, setPage] = useState(1);

  // Scope options (mata pelajaran mengajar guru) dari salah satu hasil.
  const [subjectOptions, setSubjectOptions] = useState<SelectOption<number>[]>([]);

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

  const applyFilters = () => {
    setPage(1);
    load(1, search, subjectId, status);
  };

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Ujian</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Ujian pada mata pelajaran yang menjadi scope mengajar Anda.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Daftar Ujian"
          description={meta ? `${meta.total} ujian` : undefined}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari judul..."
                  className="w-48 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-primary-container focus:outline-none"
                />
              </div>
              <Select<number> options={subjectOptions} value={subjectId} onChange={setSubjectId} placeholder="Mapel" isClearable className="w-32" />
              <Select<ExamStatus> options={statusOptions} value={status} onChange={setStatus} placeholder="Status" isClearable className="w-32" />
              <Button size="sm" onClick={applyFilters} disabled={loading}>
                Cari
              </Button>
            </div>
          }
        />
        <CardBody>
          {error ? (
            <p className="text-sm text-error">Gagal memuat ujian: {error}</p>
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
        </CardBody>
        {meta && meta.last_page > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">
              Halaman {meta.current_page} dari {meta.last_page}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1 || loading} onClick={() => { const n = page - 1; setPage(n); load(n, search, subjectId, status); }}>
                Sebelumnya
              </Button>
              <Button variant="secondary" size="sm" disabled={page >= (meta.last_page ?? 1) || loading} onClick={() => { const n = page + 1; setPage(n); load(n, search, subjectId, status); }}>
                Berikutnya
              </Button>
            </div>
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
              <h3 className="text-lg font-bold text-on-surface">{detail.title}</h3>
              <p className="mt-1 text-sm text-on-surface-variant">{detail.subject?.name ?? "-"}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-surface-container-high p-3">
                <p className="text-xs text-on-surface-variant">Durasi</p>
                <p className="mt-1 text-sm font-semibold text-on-surface">{detail.duration_minutes} menit</p>
              </div>
              <div className="rounded-xl bg-surface-container-high p-3">
                <p className="text-xs text-on-surface-variant">Jumlah Soal</p>
                <p className="mt-1 text-sm font-semibold text-on-surface">{detail.total_questions}</p>
              </div>
              <div className="rounded-xl bg-surface-container-high p-3">
                <p className="text-xs text-on-surface-variant">Maks. Percobaan</p>
                <p className="mt-1 text-sm font-semibold text-on-surface">{detail.max_attempts}</p>
              </div>
            </div>
            {detail.description && (
              <p className="text-sm text-on-surface-variant">{detail.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant={STATUS_VARIANTS[detail.status] ?? "neutral"}>{STATUS_LABELS[detail.status]}</Badge>
              <Badge variant="neutral">Acak soal: {detail.shuffle_questions ? "Ya" : "Tidak"}</Badge>
              <Badge variant="neutral">Acak opsi: {detail.shuffle_options ? "Ya" : "Tidak"}</Badge>
              <Badge variant="neutral">Tampilkan hasil: {detail.show_result ? "Ya" : "Tidak"}</Badge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
