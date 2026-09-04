import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Form";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { examScheduleService } from "../api/exam-schedule.service";
import type { ExamSchedule } from "../api/types";
import ExamScheduleForm from "../components/exam-schedule/ExamScheduleForm";
import ExamScheduleDeleteDialog from "../components/exam-schedule/ExamScheduleDeleteDialog";
import Pagination from "../../../components/ui/Pagination";

const PER_PAGE = 10;

interface QueryState {
  exam_date: string | undefined;
  page: number;
}

function formatDate(value?: string): string {
  if (!value) return "-";
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}

export default function ExamSchedulesPage() {
  const [data, setData] = useState<ExamSchedule[]>([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: PER_PAGE,
    total: 0,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [dateFilter, setDateFilter] = useState("");

  const [query, setQuery] = useState<QueryState>({
    exam_date: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExamSchedule | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ExamSchedule | null>(null);

  useEffect(() => {
    let active = true;

    examScheduleService
      .list({
        exam_date: query.exam_date,
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
        toast.error("Gagal memuat data jadwal ujian", {
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

  const handleDateChange = useCallback((value: string) => {
    setDateFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      exam_date: value || undefined,
      page: 1,
    }));
  }, []);

  const handleClearDate = useCallback(() => {
    setDateFilter("");
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, exam_date: undefined, page: 1 }));
  }, []);

  const goToPage = useCallback((target: number) => {
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, page: target }));
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

  const openEdit = useCallback((row: ExamSchedule) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: ExamSchedule) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = ExamSchedule;
    return [
      {
        header: "Ujian",
        accessor: "exam_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm font-medium text-on-surface">
            {row.exam?.title ?? `#${row.exam_id}`}
          </span>
        ),
      },
      {
        header: "Sesi",
        accessor: "session_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">
            {row.session?.name ?? `#${row.session_id}`}
          </span>
        ),
      },
      {
        header: "Ruangan",
        accessor: "room_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">
            {row.room?.name ?? `#${row.room_id}`}
          </span>
        ),
      },
      {
        header: "Tanggal",
        accessor: "exam_date" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">{formatDate(row.exam_date)}</span>
        ),
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
              aria-label="Edit jadwal"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus jadwal"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [openEdit, openDelete]);


  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Jadwal Ujian"
        description="Kelola jadwal pelaksanaan ujian."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah Jadwal
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end *:md:gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:max-w-[220px]">
            <span className="whitespace-nowrap">Tanggal Ujian</span>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => handleDateChange(e.target.value)}
              />
              {dateFilter && (
                <Button variant="ghost" size="sm" onClick={handleClearDate}>
                  Reset
                </Button>
              )}
            </div>
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data jadwal ujian.</p>
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
            {/* Kartu untuk mobile */}
            <div className="space-y-3 sm:hidden">
              {loading ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Memuat data...
                </div>
              ) : data.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Belum ada jadwal ujian.
                </div>
              ) : (
                data.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-on-surface">
                          {row.exam?.title ?? `#${row.exam_id}`}
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {row.session?.name ?? `#${row.session_id}`} ·{" "}
                          {row.room?.name ?? `#${row.room_id}`}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {formatDate(row.exam_date)}
                        </p>
                      </div>
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
                ))
              )}
            </div>

            <div className="hidden sm:block">
              <DataTable
                columns={columns}
                data={data}
                loading={loading}
                emptyMessage="Belum ada jadwal ujian."
              />
            </div>
          </>
        )}

        <Pagination meta={meta} onPageChange={goToPage} loading={loading} error={error} />
      </Card>

      <ExamScheduleForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <ExamScheduleDeleteDialog
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
