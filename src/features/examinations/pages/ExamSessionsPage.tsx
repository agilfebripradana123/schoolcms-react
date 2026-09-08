import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { examSessionService } from "../api/exam-session.service";
import type { ExamSession } from "../api/types";
import ExamSessionForm from "../components/exam-session/ExamSessionForm";
import ExamSessionDeleteDialog from "../components/exam-session/ExamSessionDeleteDialog";
import Pagination from "../../../components/ui/Pagination";

const PER_PAGE = 10;

function formatTime(value?: string): string {
  if (!value) return "-";
  return value.slice(0, 5);
}

function computeDuration(start?: string, end?: string): string {
  if (!start || !end) return "-";
  const startParts = start.split(":");
  const endParts = end.split(":");
  const sh = parseInt(startParts[0] ?? "0", 10);
  const sm = parseInt(startParts[1] ?? "0", 10);
  const eh = parseInt(endParts[0] ?? "0", 10);
  const em = parseInt(endParts[1] ?? "0", 10);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const diff = endMin - startMin;
  if (diff <= 0) return "-";
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}j`;
  return `${h}j ${m}m`;
}

export default function ExamSessionsPage() {
  const [data, setData] = useState<ExamSession[]>([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: PER_PAGE,
    total: 0,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = useState<{ search?: string; page: number }>({
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExamSession | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ExamSession | null>(null);

  useEffect(() => {
    let active = true;

    examSessionService
      .list({ search: query.search, page: query.page, per_page: PER_PAGE })
      .then((res) => {
        if (!active) return;
        setData(res.data);
        setMeta(res.meta);
      })
      .catch((err) => {
        if (!active) return;
        setError(toApiError(err));
        setData([]);
        toast.error("Gagal memuat data sesi ujian", {
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

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      setError(null);
      setQuery({ search: value || undefined, page: 1 });
    }, 400);
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

  const openEdit = useCallback((row: ExamSession) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: ExamSession) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = ExamSession;
    return [
      {
        header: "Nama Sesi",
        accessor: "name" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm font-medium text-on-surface">{row.name}</span>
        ),
      },
      {
        header: "Mulai",
        accessor: "start_time" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">{formatTime(row.start_time)}</span>
        ),
      },
      {
        header: "Selesai",
        accessor: "end_time" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">{formatTime(row.end_time)}</span>
        ),
      },
      {
        header: "Durasi",
        accessor: "start_time" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">
            {computeDuration(row.start_time, row.end_time)}
          </span>
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
              aria-label="Edit sesi"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus sesi"
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
        title="Sesi Ujian"
        description="Kelola sesi dan waktu pelaksanaan ujian."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah Sesi
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:items-end *:sm:gap-3">
          <div className="w-full sm:max-w-xs">
            <Search
              value={search}
              onChange={handleSearch}
              placeholder="Cari nama sesi..."
            />
          </div>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data sesi ujian.</p>
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
                  Belum ada sesi ujian.
                </div>
              ) : (
                data.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-on-surface">{row.name}</p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {formatTime(row.start_time)} – {formatTime(row.end_time)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {computeDuration(row.start_time, row.end_time)}
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
                emptyMessage="Belum ada sesi ujian."
              />
            </div>
          </>
        )}

        <Pagination meta={meta} onPageChange={goToPage} loading={loading} error={error} />
      </Card>

      <ExamSessionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <ExamSessionDeleteDialog
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
