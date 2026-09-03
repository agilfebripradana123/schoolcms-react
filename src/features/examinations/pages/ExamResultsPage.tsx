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
import { examResultService } from "../api/exam-result.service";
import { examParticipantService } from "../api/exam-participant.service";
import type {
  ExamParticipant,
  ExamResult,
  ExamResultStatus,
} from "../api/types";
import ExamResultForm from "../components/exam-result/ExamResultForm";
import ExamResultDeleteDialog from "../components/exam-result/ExamResultDeleteDialog";

const PER_PAGE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "pending", label: "Menunggu" },
  { value: "graded", label: "Dinilai" },
];

const STATUS_BADGE: Record<ExamResultStatus, { label: string; variant: "primary" | "secondary" | "success" | "warning" | "danger" | "neutral" }> = {
  pending: { label: "Menunggu", variant: "secondary" },
  graded: { label: "Dinilai", variant: "success" },
};

interface QueryState {
  status: string | undefined;
  participant_id: number | undefined;
  page: number;
}

function participantLabel(p: ExamParticipant | undefined, participantId: number): string {
  if (!p) return `#${participantId}`;
  if (p.student?.name) return p.student.name;
  if (p.exam_card_number) return p.exam_card_number;
  return `#${p.id}`;
}

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export default function ExamResultsPage() {
  const [data, setData] = useState<ExamResult[]>([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: PER_PAGE,
    total: 0,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [participantFilter, setParticipantFilter] = useState<string>("all");
  const [participantOptions, setParticipantOptions] = useState<ExamParticipant[]>([]);

  const [query, setQuery] = useState<QueryState>({
    status: undefined,
    participant_id: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExamResult | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ExamResult | null>(null);

  useEffect(() => {
    examParticipantService
      .list({ per_page: 100 })
      .then((res) => setParticipantOptions(res.data))
      .catch(() => setParticipantOptions([]));
  }, []);

  useEffect(() => {
    let active = true;

    examResultService
      .list({
        status: query.status,
        participant_id: query.participant_id,
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
        toast.error("Gagal memuat data hasil ujian", {
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

  const handleParticipantChange = useCallback((value: string) => {
    setParticipantFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      participant_id: value === "all" ? undefined : Number(value),
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

  const openEdit = useCallback((row: ExamResult) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: ExamResult) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = ExamResult;
    return [
      {
        header: "Peserta",
        accessor: "participant_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-on-surface">
              {participantLabel(row.participant, row.participant_id)}
            </p>
            {row.participant?.exam_card_number && (
              <p className="text-xs text-on-surface-variant">
                {row.participant.exam_card_number}
              </p>
            )}
          </div>
        ),
      },
      {
        header: "Nilai",
        accessor: "total_score" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm font-semibold text-on-surface">
            {row.total_score ?? "-"}
          </span>
        ),
      },
      {
        header: "Benar",
        accessor: "correct_count" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">{row.correct_count ?? "-"}</span>
        ),
      },
      {
        header: "Salah",
        accessor: "wrong_count" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">{row.wrong_count ?? "-"}</span>
        ),
      },
      {
        header: "Tidak Dijawab",
        accessor: "unanswered_count" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">
            {row.unanswered_count ?? "-"}
          </span>
        ),
      },
      {
        header: "Grade",
        accessor: "grade" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">{row.grade || "-"}</span>
        ),
      },
      {
        header: "Status",
        accessor: "status" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => {
          const s = STATUS_BADGE[row.status] ?? STATUS_BADGE.pending;
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
              aria-label="Edit hasil"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus hasil"
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

  const participantFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Peserta" },
      ...participantOptions.map((p) => ({
        value: String(p.id),
        label: participantLabel(p, p.id),
      })),
    ],
    [participantOptions],
  );

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Hasil Ujian"
        description="Kelola hasil dan penilaian ujian."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah Hasil
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end *:md:gap-3">
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
            <span className="whitespace-nowrap">Peserta</span>
            <AppSelect
              options={participantFilterOptions}
              value={participantFilter}
              onChange={(v) => handleParticipantChange(v ?? "all")}
              placeholder="Pilih Peserta"
            />
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data hasil ujian.</p>
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
                  Belum ada hasil ujian.
                </div>
              ) : (
                data.map((row) => {
                  const s = STATUS_BADGE[row.status] ?? STATUS_BADGE.pending;
                  return (
                    <div
                      key={row.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-on-surface">
                            {participantLabel(row.participant, row.participant_id)}
                          </p>
                          <p className="mt-0.5 text-xs text-on-surface-variant">
                            {row.participant?.exam_card_number
                              ? `${row.participant.exam_card_number} · `
                              : ""}
                            Nilai {row.total_score ?? "-"}
                          </p>
                          <p className="mt-1 flex flex-wrap gap-3 text-xs text-on-surface-variant">
                            <span>Benar {row.correct_count ?? "-"}</span>
                            <span>Salah {row.wrong_count ?? "-"}</span>
                            <span>Tidak Dijawab {row.unanswered_count ?? "-"}</span>
                            <span>Grade {row.grade || "-"}</span>
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {formatDateTime(row.graded_at)}
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
                emptyMessage="Belum ada hasil ujian."
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

      <ExamResultForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <ExamResultDeleteDialog
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
