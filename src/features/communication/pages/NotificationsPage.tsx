import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AppSelect from "@/components/ui/Select";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { notificationService } from "../api/notification.service";
import type { UserNotification } from "../api/types";

const PER_PAGE = 10;

const READ_FILTER_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "unread", label: "Belum Dibaca" },
  { value: "read", label: "Sudah Dibaca" },
];

interface QueryState {
  is_read: boolean | undefined;
  page: number;
}

export default function NotificationsPage() {
  const [data, setData] = useState<UserNotification[]>([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: PER_PAGE,
    total: 0,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [readFilter, setReadFilter] = useState<string>("all");

  const [query, setQuery] = useState<QueryState>({
    is_read: undefined,
    page: 1,
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<UserNotification | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    notificationService
      .list({
        is_read: query.is_read,
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
        toast.error("Gagal memuat data notifikasi", {
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

  const handleReadChange = useCallback((value: string) => {
    setReadFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      is_read: value === "all" ? undefined : value === "read",
      page: 1,
    }));
  }, []);

  const handleToggleRead = useCallback(async (row: UserNotification) => {
    setUpdatingId(row.id);
    try {
      const next = !row.is_read;
      await notificationService.update(row.id, { is_read: next });
      toast.success(next ? "Notifikasi ditandai dibaca." : "Notifikasi ditandai belum dibaca.");
      setQuery((prev) => ({ ...prev }));
    } catch (err) {
      toast.error("Gagal memperbarui notifikasi", {
        description: toApiError(err).message,
      });
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!toDelete) return;
    try {
      await notificationService.remove(toDelete.id);
      toast.success("Notifikasi berhasil dihapus.");
      setDeleteOpen(false);
      setToDelete(null);
      setQuery((prev) => {
        if (data.length === 1 && prev.page > 1) {
          return { ...prev, page: prev.page - 1 };
        }
        return { ...prev };
      });
    } catch (err) {
      toast.error("Gagal menghapus notifikasi", {
        description: toApiError(err).message,
      });
    }
  }, [toDelete, data.length]);

  const openDelete = useCallback((row: UserNotification) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = UserNotification;
    return [
      {
        header: "Pesan",
        accessor: "title" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="min-w-0">
            <p
              className={`truncate text-sm font-medium ${
                row.is_read ? "text-on-surface-variant" : "text-on-surface"
              }`}
            >
              {row.title}
            </p>
            <p className="truncate text-xs text-on-surface-variant">
              {row.message ?? "-"}
            </p>
          </div>
        ),
      },
      {
        header: "Tipe",
        accessor: "type" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) =>
          row.type ? (
            <div className="flex justify-center">
              <Badge variant="primary">{row.type}</Badge>
            </div>
          ) : (
            <span className="text-sm text-slate-400">-</span>
          ),
      },
      {
        header: "Pengguna",
        accessor: "user_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="whitespace-nowrap text-sm text-slate-700">
            {row.user?.name ?? `#${row.user_id}`}
          </span>
        ),
      },
      {
        header: "Status",
        accessor: "is_read" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex justify-center">
            <Badge variant={row.is_read ? "neutral" : "warning"}>
              {row.is_read ? "Dibaca" : "Baru"}
            </Badge>
          </div>
        ),
      },
      {
        header: "Aksi",
        accessor: "id" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleToggleRead(row)}
              disabled={updatingId === row.id}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container disabled:opacity-50"
              aria-label={row.is_read ? "Tandai belum dibaca" : "Tandai dibaca"}
            >
              <Check className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus notifikasi"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [updatingId, handleToggleRead, openDelete]);

  const isFirstPage = meta.current_page <= 1;
  const isLastPage = meta.current_page >= meta.last_page;
  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  const emptyMessage =
    query.is_read !== undefined
      ? "Tidak ada notifikasi yang sesuai dengan filter."
      : "Belum ada notifikasi.";

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Notifikasi"
        description="Kelola notifikasi pengguna sekolah."
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:min-w-[180px] md:flex-1">
            <span className="whitespace-nowrap">Status</span>
            <AppSelect
              options={READ_FILTER_OPTIONS}
              value={readFilter}
              onChange={(v) => handleReadChange(v ?? "all")}
              placeholder="Pilih Status"
            />
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data notifikasi.</p>
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
                  {emptyMessage}
                </div>
              ) : (
                data.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p
                          className={`font-semibold ${
                            row.is_read ? "text-on-surface-variant" : "text-on-surface"
                          }`}
                        >
                          {row.title}
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {row.message ?? "-"}
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {row.user?.name ?? `#${row.user_id}`}
                        </p>
                      </div>
                      <Badge
                        variant={row.is_read ? "neutral" : "warning"}
                        className="shrink-0"
                      >
                        {row.is_read ? "Dibaca" : "Baru"}
                      </Badge>
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={updatingId === row.id}
                        onClick={() => handleToggleRead(row)}
                      >
                        <Check className="h-4 w-4" />{" "}
                        {row.is_read ? "Belum Dibaca" : "Tandai Dibaca"}
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
                emptyMessage={emptyMessage}
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

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Notifikasi"
        description={`Apakah Anda yakin ingin menghapus notifikasi "${toDelete?.title || ""}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        destructive
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  );
}