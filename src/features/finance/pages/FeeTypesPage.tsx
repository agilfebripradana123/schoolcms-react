import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import AppSelect from "@/components/ui/Select";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { ApiError } from "@/types";
import { feeTypeService } from "../api/fee-type.service";
import type { FeeType } from "../api/types";
import FeeTypeForm from "../components/fee-type/FeeTypeForm";
import FeeTypeDeleteDialog from "../components/fee-type/FeeTypeDeleteDialog";

const PER_PAGE = 10;

type ActivityFilter = "all" | "active" | "inactive";

interface QueryState {
  q: string;
  is_active: boolean | undefined;
  page: number;
}

function activityToFilter(status: ActivityFilter): boolean | undefined {
  if (status === "all") return undefined;
  return status === "active";
}

export default function FeeTypesPage() {
  const [data, setData] = useState<FeeType[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [search, setSearch] = useState("");
  const [activity, setActivity] = useState<ActivityFilter>("all");
  const [query, setQuery] = useState<QueryState>({ q: "", is_active: undefined, page: 1 });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FeeType | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<FeeType | null>(null);

  const searchTimeout = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    feeTypeService
      .list({
        q: query.q || undefined,
        is_active: query.is_active,
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
        toast.error("Gagal memuat data jenis tagihan", {
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
      setQuery((prev) => ({ ...prev, q: value, page: 1 }));
    }, 400);
  }, []);

  const handleActivityChange = useCallback((value: ActivityFilter) => {
    setActivity(value);
    setQuery((prev) => ({ ...prev, is_active: activityToFilter(value), page: 1 }));
  }, []);

  const goToPage = useCallback((target: number) => {
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const handleSaved = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
    setQuery((prev) => ({ ...prev }));
  }, []);

  const handleDeleted = useCallback(() => {
    setDeleteOpen(false);
    setToDelete(null);
    setQuery((prev) => ({ ...prev }));
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: FeeType) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: FeeType) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = FeeType;
    return [
      {
        header: "Nama Tagihan",
        accessor: "name" as keyof Row,
        className: "px-6 py-4 text-sm font-medium text-on-surface",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>{row.name}</span>
        ),
      },
      {
        header: "Jumlah",
        accessor: "amount" as keyof Row,
        headerClassName: "px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-right text-sm text-on-surface font-semibold whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>
            {row.amount != null ? formatCurrency(row.amount) : "-"}
          </span>
        ),
      },
      {
        header: "Deskripsi",
        accessor: "description" as keyof Row,
        className: "px-6 py-4 text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>{row.description || "-"}</span>
        ),
      },
      {
        header: "Status",
        accessor: "is_active" as keyof Row,
        headerClassName: "px-6 py-3.5 text-sm font-semibold text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-sm whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex items-center justify-center gap-2">
            <Badge variant={row.is_active ? "success" : "secondary"}>
              {row.is_active ? "Aktif" : "Tidak Aktif"}
            </Badge>
          </div>
        ),
      },
      {
        header: "Aksi",
        accessor: "id" as keyof Row,
        headerClassName: "px-4 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider",
        className: "px-4 py-4 text-center text-sm",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label={`Edit ${row.name}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label={`Hapus ${row.name}`}
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

  const activityFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Status" },
      { value: "active", label: "Aktif" },
      { value: "inactive", label: "Tidak Aktif" },
    ],
    [],
  );

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Jenis Tagihan"
        description="Kelola jenis tagihan yang akan ditagihkan kepada siswa."
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
              placeholder="Cari nama tagihan..."
            />
          </div>
          <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
            <span className="whitespace-nowrap">Status</span>
            <AppSelect
              options={activityFilterOptions}
              value={activity}
              onChange={(v) => handleActivityChange((v ?? "all") as ActivityFilter)}
              placeholder="Pilih Status"
              isSearchable={false}
            />
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data jenis tagihan.</p>
            <Button
              variant="secondary"
              onClick={() => setQuery((prev) => ({ ...prev }))}
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
                  Belum ada data jenis tagihan.
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
                          {row.amount != null ? formatCurrency(row.amount) : "-"}
                        </p>
                        {row.description && (
                          <p className="text-xs text-on-surface-variant">
                            {row.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={row.is_active ? "success" : "secondary"}
                        className="shrink-0 px-2.5 py-1 text-xs leading-4"
                      >
                        {row.is_active ? "Aktif" : "Tidak Aktif"}
                      </Badge>
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
                emptyMessage="Belum ada data jenis tagihan."
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

      <FeeTypeForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <FeeTypeDeleteDialog
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