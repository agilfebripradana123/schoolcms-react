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
import { settingService } from "../api/setting.service";
import type { Setting } from "../api/types";
import ErrorState from "../components/ErrorState";
import SettingForm from "../components/setting/SettingForm";
import SettingDeleteDialog from "../components/setting/SettingDeleteDialog";

const PER_PAGE = 10;

interface QueryState {
  q: string;
  page: number;
}

export default function SettingsPage() {
  const [data, setData] = useState<Setting[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState<QueryState>({ q: "", page: 1 });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Setting | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Setting | null>(null);

  const searchTimeout = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    settingService
      .list({ q: query.q || undefined, page: query.page, per_page: PER_PAGE })
      .then((res) => {
        if (!active) return;
        setData(res.data);
        setMeta(res.meta);
        setPage(res.meta.current_page);
      })
      .catch((err) => {
        if (!active) return;
        setError(toApiError(err));
        setData([]);
        toast.error("Gagal memuat data pengaturan", {
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

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    searchTimeout.current = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      setQuery((prev) => ({ ...prev, q: value, page: 1 }));
    }, 400);
  }, []);

  const goToPage = useCallback((target: number) => {
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev }));
  }, []);

  const handleSaved = useCallback(
    (saved: Setting) => {
      setLoading(true);
      setError(null);
      setFormOpen(false);
      setEditing(null);
      setData((prev) =>
        prev.some((s) => s.id === saved.id)
          ? prev.map((s) => (s.id === saved.id ? saved : s))
          : [saved, ...prev],
      );
      setQuery((prev) => ({
        ...prev,
        page: Math.max(1, Math.min(prev.page, meta.last_page)),
      }));
    },
    [meta.last_page],
  );

  const handleDeleted = useCallback(() => {
    setLoading(true);
    setError(null);
    setDeleteOpen(false);
    setToDelete(null);
    const isLastPage = page > 1 && meta.total - 1 <= (page - 1) * meta.per_page;
    setQuery((prev) => ({
      ...prev,
      page: isLastPage ? page - 1 : page,
    }));
  }, [page, meta.total, meta.per_page]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: Setting) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Setting) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = Setting;
    return [
      {
        header: "Key",
        accessor: "key" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="font-medium text-on-surface">{row.key}</span>
        ),
      },
      {
        header: "Value",
        accessor: "value" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="block max-w-xs truncate text-slate-700">
            {row.value ?? "-"}
          </span>
        ),
      },
      {
        header: "Description",
        accessor: "description" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="block max-w-xs truncate text-slate-700">
            {row.description ?? "-"}
          </span>
        ),
      },
      {
        header: "Aksi",
        accessor: "id" as keyof Row,
        headerClassName: "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label={`Edit ${row.key}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label={`Hapus ${row.key}`}
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

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Pengaturan"
        description="Kelola pengaturan sistem."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <Search
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari key pengaturan..."
            />
          </div>
        </div>

        {error ? (
          <ErrorState error={error} onRetry={retry} />
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
                  Tidak ada pengaturan.
                </div>
              ) : (
                data.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-on-surface">{row.key}</p>
                      <p className="mt-0.5 break-words text-sm text-on-surface-variant">
                        {row.value ?? "-"}
                      </p>
                      {row.description && (
                        <p className="mt-0.5 text-xs text-outline">
                          {row.description}
                        </p>
                      )}
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
                emptyMessage="Tidak ada pengaturan."
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

      <SettingForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <SettingDeleteDialog
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
