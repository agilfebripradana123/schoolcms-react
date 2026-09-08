import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import AppSelect from "@/components/ui/Select";
import Pagination from "@/components/ui/Pagination";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { ApiError } from "@/types";
import { announcementService } from "../api/announcement.service";
import type { Announcement, AnnouncementCategory } from "../api/types";
import AnnouncementForm from "../components/announcement/AnnouncementForm";
import AnnouncementDeleteDialog from "../components/announcement/AnnouncementDeleteDialog";

const PER_PAGE = 10;

const CATEGORY_LABELS: Record<AnnouncementCategory, string> = {
  umum: "Umum",
  guru: "Guru",
  siswa: "Siswa",
};

const CATEGORY_VARIANTS: Record<AnnouncementCategory, "primary" | "success" | "warning" | "neutral"> = {
  umum: "neutral",
  guru: "primary",
  siswa: "warning",
};

const CATEGORY_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "Semua Kategori" },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

type AnnouncementStatus = "aktif" | "terjadwal" | "kedaluwarsa";

const STATUS_META: Record<AnnouncementStatus, { label: string; variant: "success" | "warning" | "neutral" }> = {
  aktif: { label: "Aktif", variant: "success" },
  terjadwal: { label: "Terjadwal", variant: "warning" },
  kedaluwarsa: { label: "Kedaluwarsa", variant: "neutral" },
};

function announcementStatus(a: Announcement): AnnouncementStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (a.expired_date) {
    const expired = new Date(a.expired_date);
    expired.setHours(0, 0, 0, 0);
    if (expired < today) return "kedaluwarsa";
  }

  if (a.publish_date) {
    const publish = new Date(a.publish_date);
    publish.setHours(0, 0, 0, 0);
    if (publish > today) return "terjadwal";
  }

  return "aktif";
}

export default function AnnouncementsPage() {
  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Announcement | null>(null);

  const fetchList = useCallback(() => {
    let active = true;

    announcementService
      .list()
      .then((res) => {
        if (!active) return;
        setData(res.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(toApiError(err));
        setData([]);
        toast.error("Gagal memuat data pengumuman", {
          description: toApiError(err).message,
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return fetchList();
  }, [fetchList]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data
      .filter((a) => (categoryFilter === "all" ? true : a.category === categoryFilter))
      .filter((a) =>
        !q
          ? true
          : [a.title, a.content]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(q)),
      );
  }, [data, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageData = useMemo(() => {
    const start = (safePage - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, safePage]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategoryFilter(value);
    setPage(1);
  }, []);

  const goToPage = useCallback((target: number) => {
    setPage(target);
  }, []);

  const handleSaved = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
    setLoading(true);
    setError(null);
    fetchList();
  }, [fetchList]);

  const handleDeleted = useCallback(() => {
    setDeleteOpen(false);
    setToDelete(null);
    setLoading(true);
    setError(null);
    fetchList();
  }, [fetchList]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: Announcement) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Announcement) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = Announcement;
    return [
      {
        header: "Judul",
        accessor: "title" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-on-surface">{row.title}</p>
            <p className="truncate text-xs text-on-surface-variant">
              {row.content ?? "-"}
            </p>
          </div>
        ),
      },
      {
        header: "Kategori",
        accessor: "category" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex justify-center">
            <Badge variant={CATEGORY_VARIANTS[row.category] ?? "neutral"}>
              {CATEGORY_LABELS[row.category] ?? row.category ?? "-"}
            </Badge>
          </div>
        ),
      },
      {
        header: "Tanggal Terbit",
        accessor: "publish_date" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="whitespace-nowrap text-sm text-slate-700">
            {row.publish_date ? formatDate(row.publish_date) : "-"}
          </span>
        ),
      },
      {
        header: "Status",
        accessor: "expired_date" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => {
          const s = STATUS_META[announcementStatus(row)];
          return (
            <div className="flex justify-center">
              <Badge variant={s.variant}>{s.label}</Badge>
            </div>
          );
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
              aria-label={`Edit pengumuman ${row.title}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label={`Hapus pengumuman ${row.title}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [openEdit, openDelete]);

  const emptyMessage =
    search || categoryFilter !== "all"
      ? "Tidak ada pengumuman yang sesuai dengan pencarian atau filter."
      : "Belum ada pengumuman.";
  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Pengumuman"
        description="Kelola pengumuman untuk umum, guru, dan siswa."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:items-end *:sm:gap-3">
          <div className="w-full sm:max-w-xs">
            <Search
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari judul / konten..."
            />
          </div>

          <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
            <span className="whitespace-nowrap">Kategori</span>
            <AppSelect
              options={CATEGORY_FILTER_OPTIONS}
              value={categoryFilter}
              onChange={(v) => handleCategoryChange(v ?? "all")}
              placeholder="Pilih Kategori"
            />
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data pengumuman.</p>
            <Button
              variant="secondary"
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchList();
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
              ) : pageData.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  {emptyMessage}
                </div>
              ) : (
                pageData.map((row) => {
                  const s = STATUS_META[announcementStatus(row)];
                  return (
                    <div
                      key={row.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-on-surface">{row.title}</p>
                          <p className="truncate text-xs text-on-surface-variant">
                            {row.content ?? "-"}
                          </p>
                          <p className="mt-0.5 text-xs text-on-surface-variant">
                            {row.publish_date ? formatDate(row.publish_date) : "-"}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <Badge variant={CATEGORY_VARIANTS[row.category] ?? "neutral"}>
                            {CATEGORY_LABELS[row.category] ?? row.category ?? "-"}
                          </Badge>
                          <Badge variant={s.variant}>{s.label}</Badge>
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
                  );
                })
              )}
            </div>

            <div className="hidden sm:block">
              <DataTable
                columns={columns}
                data={pageData}
                loading={loading}
                emptyMessage={emptyMessage}
              />
            </div>
          </>
        )}

        <Pagination
          meta={{ current_page: safePage, last_page: totalPages, per_page: PER_PAGE, total: filtered.length }}
          onPageChange={goToPage}
          loading={loading}
          error={error}
        />
      </Card>

      <AnnouncementForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <AnnouncementDeleteDialog
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