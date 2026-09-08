import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import SortSelect from "@/components/ui/SortSelect";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Pagination from "@/components/ui/Pagination";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { transferService } from "../api/transfer.service";
import type { Transfer } from "../api/types";
import TransferForm from "../components/TransferForm";

const PER_PAGE = 10;

const SORT_OPTIONS = [
  { value: "nama-az", label: "Nama A–Z" },
  { value: "nama-za", label: "Nama Z–A" },
  { value: "tanggal-terbaru", label: "Tanggal Terbaru" },
  { value: "tanggal-terlama", label: "Tanggal Terlama" },
];

const TYPE_META: Record<string, { label: string; variant: "success" | "warning" | "danger" }> = {
  masuk: { label: "Masuk", variant: "success" },
  keluar: { label: "Keluar", variant: "danger" },
};

function formatDate(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value.substring(0, 10)
    : d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function TransferListPage() {
  const [data, setData] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("nama-az");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transfer | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Transfer | null>(null);

  const fetchList = useCallback(() => {
    let active = true;

    transferService
      .list()
      .then((res) => {
        if (!active) return;
        setData(res.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(toApiError(err));
        setData([]);
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
    const sorted = [...data].sort((a, b) => {
      switch (sort) {
        case "nama-za":
          return (b.student?.name ?? "").localeCompare(a.student?.name ?? "", "id");
        case "tanggal-terbaru":
          return (b.transfer_date ?? "").localeCompare(a.transfer_date ?? "");
        case "tanggal-terlama":
          return (a.transfer_date ?? "").localeCompare(b.transfer_date ?? "");
        default:
          return (a.student?.name ?? "").localeCompare(b.student?.name ?? "", "id");
      }
    });
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((t) =>
      [t.student?.name, t.student?.nisn, t.type, t.from_school, t.to_school, t.reason]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [data, search, sort]);

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

  const handleSortChange = useCallback((value: string) => {
    setSort(value);
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

  const handleDeleteConfirm = useCallback(async () => {
    if (!toDelete) return;
    try {
      await transferService.remove(toDelete.id);
      toast.warning("Mutasi siswa berhasil dihapus.");
      setDeleteOpen(false);
      setToDelete(null);
      setLoading(true);
      setError(null);
      fetchList();
    } catch (err) {
      toast.error("Gagal menghapus mutasi siswa", {
        description: toApiError(err).message,
      });
    }
  }, [toDelete, fetchList]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: Transfer) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Transfer) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = Transfer;
    return [
      {
        header: "Siswa",
        accessor: "student" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <div>
            <p className="font-medium text-on-surface">{row.student?.name ?? "-"}</p>
            <p className="text-xs text-on-surface-variant">{row.student?.nisn ?? ""}</p>
          </div>
        ),
      },
      {
        header: "Jenis",
        accessor: "type" as keyof Row,
        render: (_val: unknown, row: Row) => {
          const meta = TYPE_META[row.type ?? ""];
          if (!meta) return <span className="text-sm text-on-surface-variant">{row.type ?? "-"}</span>;
          return <Badge variant={meta.variant}>{meta.label}</Badge>;
        },
      },
      {
        header: "Tanggal Mutasi",
        accessor: "transfer_date" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <span className="text-sm text-on-surface-variant whitespace-nowrap">
            {formatDate(row.transfer_date)}
          </span>
        ),
      },
      {
        header: "Sekolah",
        accessor: "from_school" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <div className="flex items-center gap-1.5 text-sm">
            <span className="max-w-[180px] truncate text-on-surface" title={row.from_school ?? undefined}>
              {row.from_school ?? "-"}
            </span>
            <span className="text-slate-400">→</span>
            <span className="max-w-[180px] truncate text-on-surface" title={row.to_school ?? undefined}>
              {row.to_school ?? "-"}
            </span>
          </div>
        ),
      },
      {
        header: "Alasan",
        accessor: "reason" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <span className="line-clamp-2 max-w-[260px] text-sm leading-relaxed text-on-surface-variant" title={row.reason ?? undefined}>
            {row.reason ?? "-"}
          </span>
        ),
      },
      {
        header: "Aksi",
        accessor: "id" as keyof Row,
        headerClassName: "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_val: unknown, row: Row) => (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label="Edit mutasi"
            >
              <Pencil className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus mutasi"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        ),
      },
    ];
  }, [openEdit, openDelete]);

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Mutasi Siswa"
        description="Kelola catatan mutasi masuk / keluar siswa."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Catat Mutasi
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <Search
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari siswa / sekolah / alasan..."
            />
          </div>
          <div className="w-full sm:w-56">
            <SortSelect value={sort} options={SORT_OPTIONS} onChange={handleSortChange} />
          </div>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">{error.message}</p>
            <Button variant="secondary" onClick={() => {
              setLoading(true);
              setError(null);
              fetchList();
            }}>
              Muat Ulang
            </Button>
          </div>
        ) : (
          <>
            {/* Kartu untuk mobile */}
            <div className="space-y-3 sm:hidden">
              {loading ? (
                <div className="py-10 text-center text-slate-500">Memuat data...</div>
              ) : pageData.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  {search ? "Tidak ada mutasi yang cocok." : "Belum ada data mutasi."}
                </div>
              ) : (
                pageData.map((row) => {
                  const meta = TYPE_META[row.type ?? ""];
                  return (
                    <div
                      key={row.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-on-surface">{row.student?.name ?? "-"}</p>
                          <p className="mt-0.5 text-xs text-on-surface-variant">{row.student?.nisn ?? ""}</p>
                          <p className="text-xs text-on-surface-variant">
                            {formatDate(row.transfer_date)}
                          </p>
                        </div>
                        {meta ? (
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        ) : (
                          <span className="text-sm text-on-surface-variant">{row.type ?? "-"}</span>
                        )}
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-on-surface-variant">
                        <p>{row.from_school ?? "-"}</p>
                        <p>{row.to_school ?? ""}</p>
                        <p>{row.reason ?? ""}</p>
                      </div>
                      <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                        <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
                          <Pencil className="h-4 w-4" /> Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => openDelete(row)}>
                          <Trash2 className="h-4 w-4" /> Hapus
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Tabel untuk desktop */}
            <div className="hidden sm:block">
              <DataTable
                columns={columns}
                data={pageData}
                loading={loading}
                emptyMessage={search ? "Tidak ada mutasi yang cocok." : "Belum ada data mutasi."}
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

      <TransferForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Mutasi Siswa"
        description="Apakah Anda yakin ingin menghapus catatan mutasi ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        destructive
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  );
}