import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import AppSelect from "@/components/ui/Select";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { examParticipantService } from "../api/exam-participant.service";
import { examService } from "../api/exam.service";
import type {
  Exam,
  ExamParticipant,
  ExamParticipantStatus,
} from "../api/types";
import ExamParticipantForm from "../components/exam-participant/ExamParticipantForm";
import ExamParticipantDeleteDialog from "../components/exam-participant/ExamParticipantDeleteDialog";

const PER_PAGE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "registered", label: "Terdaftar" },
  { value: "started", label: "Dimulai" },
  { value: "completed", label: "Selesai" },
  { value: "blocked", label: "Diblokir" },
];

const STATUS_BADGE: Record<ExamParticipantStatus, { label: string; variant: "primary" | "secondary" | "success" | "warning" | "danger" | "neutral" }> = {
  registered: { label: "Terdaftar", variant: "secondary" },
  started: { label: "Dimulai", variant: "primary" },
  completed: { label: "Selesai", variant: "success" },
  blocked: { label: "Diblokir", variant: "danger" },
};

interface QueryState {
  status: string | undefined;
  exam_id: number | undefined;
  page: number;
}

export default function ExamParticipantsPage() {
  const [data, setData] = useState<ExamParticipant[]>([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: PER_PAGE,
    total: 0,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [examFilter, setExamFilter] = useState<string>("all");
  const [examOptions, setExamOptions] = useState<Exam[]>([]);

  const [query, setQuery] = useState<QueryState>({
    status: undefined,
    exam_id: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExamParticipant | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ExamParticipant | null>(null);

  useEffect(() => {
    examService
      .list({ per_page: 100, status: "published" })
      .then((res) => setExamOptions(res.data))
      .catch(() => setExamOptions([]));
  }, []);

  useEffect(() => {
    let active = true;

    examParticipantService
      .list({
        status: query.status,
        exam_id: query.exam_id,
        page: query.page,
        per_page: PER_PAGE,
      })
      .then((res) => {
        if (!active) return;
        setData(res.data);
        setMeta(res.meta);
      })
      .catch((err) => {
        if (!active) return;
        setError(toApiError(err));
        setData([]);
        toast.error("Gagal memuat data peserta ujian", {
          description: toApiError(err).message,
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  const goToPage = useCallback((target: number) => {
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      status: value === "all" ? undefined : value,
      page: 1,
    }));
  }, []);

  const handleExamChange = useCallback((value: string) => {
    setExamFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      exam_id: value === "all" ? undefined : Number(value),
      page: 1,
    }));
  }, []);

  const handleSaved = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev }));
  }, []);

  const handleDeleted = useCallback(() => {
    setDeleteOpen(false);
    setToDelete(null);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev }));
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: ExamParticipant) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: ExamParticipant) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = ExamParticipant;
    return [
      {
        header: "Peserta",
        accessor: "student_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-on-surface">
              {row.student?.name ?? `#${row.student_id}`}
            </p>
            {row.student?.nis && (
              <p className="text-xs text-on-surface-variant">{row.student.nis}</p>
            )}
          </div>
        ),
      },
      {
        header: "Ujian",
        accessor: "exam_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="line-clamp-2 text-sm text-slate-700">
            {row.exam?.title ?? `#${row.exam_id}`}
          </span>
        ),
      },
      {
        header: "No. Kartu",
        accessor: "exam_card_number" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">{row.exam_card_number}</span>
        ),
      },
      {
        header: "Status",
        accessor: "status" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => {
          const s = STATUS_BADGE[row.status] ?? STATUS_BADGE.registered;
          return <Badge variant={s.variant}>{s.label}</Badge>;
        },
      },
      {
        header: "Aksi",
        accessor: "id" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label="Edit peserta"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus peserta"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [openEdit, openDelete]);

  const isFirstPage = meta.current_page <= 1;
  const isLastPage = meta.current_page >= meta.last_page;
  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  const examFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Ujian" },
      ...examOptions.map((exam) => ({ value: String(exam.id), label: exam.title })),
    ],
    [examOptions],
  );

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Peserta Ujian"
        description="Kelola peserta pelaksanaan ujian."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah Peserta
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:min-w-[170px] md:flex-1">
            <span className="whitespace-nowrap">Status</span>
            <AppSelect
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(v) => handleStatusChange(v ?? "all")}
              placeholder="Pilih Status"
            />
          </label>

          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:min-w-[220px] md:flex-1">
            <span className="whitespace-nowrap">Ujian</span>
            <AppSelect
              options={examFilterOptions}
              value={examFilter}
              onChange={(v) => handleExamChange(v ?? "all")}
              placeholder="Pilih Ujian"
            />
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data peserta ujian.</p>
            <Button
              variant="secondary"
              onClick={() => {
                setLoading(true);
                setError(null);
                setQuery((prev) => ({ ...prev }));
              }}
            >
              Muat Ulang
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:hidden">
              {loading ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Memuat data...
                </div>
              ) : data.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Belum ada peserta ujian.
                </div>
              ) : (
                data.map((row) => {
                  const s = STATUS_BADGE[row.status] ?? STATUS_BADGE.registered;
                  return (
                    <div
                      key={row.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-on-surface">
                            {row.student?.name ?? `#${row.student_id}`}
                          </p>
                          <p className="mt-0.5 text-xs text-on-surface-variant">
                            {row.student?.nis ? `NIS ${row.student.nis} · ` : ""}
                            {row.exam?.title ?? `#${row.exam_id}`}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {row.exam_card_number}
                          </p>
                        </div>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </div>
                      <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEdit(row)}
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => openDelete(row)}
                        >
                          <Trash2 className="h-4 w-4" /> Hapus
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="hidden sm:block">
              <DataTable
                columns={columns}
                data={data}
                loading={loading}
                emptyMessage="Belum ada peserta ujian."
              />
            </div>
          </>
        )}

        {!error && !loading && meta.total > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-on-surface-variant">
              Menampilkan {from}-{to} dari {meta.total} data
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={isFirstPage}
                onClick={() => goToPage(meta.current_page - 1)}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-on-surface-variant">
                Halaman {meta.current_page} dari {meta.last_page}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={isLastPage}
                onClick={() => goToPage(meta.current_page + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ExamParticipantForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <ExamParticipantDeleteDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setToDelete(null);
        }}
        onDeleted={handleDeleted}
        data={toDelete}
      />
    </PageContainer>
  );
}
