import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import AppSelect from "@/components/ui/Select";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { inventoryService } from "../api/inventory.service";
import { roomService } from "../api/room.service";
import type {
  ActiveStatus,
  Inventory,
  Room,
  StockMovementType,
} from "../api/types";
import InventoryForm from "../components/inventory/InventoryForm";
import InventoryDeleteDialog from "../components/inventory/InventoryDeleteDialog";
import StockActionDialog from "../components/inventory/StockActionDialog";
import MovementsDialog from "../components/inventory/MovementsDialog";

const PER_PAGE = 10;

const CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "Semua Kategori" },
  { value: "stationery", label: "Alat Tulis" },
  { value: "electronics_supplies", label: "Perlengkapan Elektronik" },
  { value: "cleaning", label: "Kebersihan" },
  { value: "lab_supplies", label: "Perlengkapan Lab" },
  { value: "office_supplies", label: "Perlengkapan Kantor" },
  { value: "other", label: "Lainnya" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
];

const LOW_STOCK_FILTER_OPTIONS = [
  { value: "all", label: "Semua Stok" },
  { value: "true", label: "Hanya Stok Menipis" },
  { value: "false", label: "Stok Normal" },
];

const STATUS_BADGE: Record<ActiveStatus, { label: string; variant: "success" | "neutral" }> = {
  active: { label: "Aktif", variant: "success" },
  inactive: { label: "Nonaktif", variant: "neutral" },
};

const STOCK_ACTION_CONFIG: Record<
  StockMovementType,
  { label: string; icon: typeof ArrowDownToLine; className: string }
> = {
  stock_in: {
    label: "Stok Masuk",
    icon: ArrowDownToLine,
    className: "hover:bg-success-container hover:text-success",
  },
  stock_out: {
    label: "Stok Keluar",
    icon: ArrowUpFromLine,
    className: "hover:bg-error-container hover:text-error",
  },
  adjustment: {
    label: "Penyesuaian Stok",
    icon: SlidersHorizontal,
    className: "hover:bg-slate-100 hover:text-primary-container",
  },
};

interface QueryState {
  search: string | undefined;
  category: string | undefined;
  status: string | undefined;
  low_stock: boolean | undefined;
  page: number;
}

export default function InventoryPage() {
  const [data, setData] = useState<Inventory[]>([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: PER_PAGE,
    total: 0,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lowStockFilter, setLowStockFilter] = useState<string>("all");
  const [roomOptions, setRoomOptions] = useState<Room[]>([]);

  const [query, setQuery] = useState<QueryState>({
    search: undefined,
    category: undefined,
    status: undefined,
    low_stock: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Inventory | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Inventory | null>(null);

  const [stockAction, setStockAction] = useState<{
    inventory: Inventory | null;
    type: StockMovementType;
  }>({ inventory: null, type: "adjustment" });
  const [movementsTarget, setMovementsTarget] = useState<Inventory | null>(null);

  useEffect(() => {
    roomService
      .list({ per_page: 100 })
      .then((res) => setRoomOptions(res.data))
      .catch(() => setRoomOptions([]));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      setQuery((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;

    inventoryService
      .list({
        search: query.search,
        category: query.category,
        status: query.status,
        low_stock: query.low_stock,
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
        toast.error("Gagal memuat data inventaris", {
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

  const roomName = useCallback(
    (roomId: number | null | undefined) =>
      roomOptions.find((room) => room.id === roomId)?.name ?? "",
    [roomOptions],
  );

  const goToPage = useCallback((target: number) => {
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategoryFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      category: value === "all" ? undefined : value,
      page: 1,
    }));
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

  const handleLowStockChange = useCallback((value: string) => {
    setLowStockFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      low_stock: value === "all" ? undefined : value === "true",
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

  const handleStockCompleted = useCallback(() => {
    setStockAction({ inventory: null, type: "adjustment" });
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev }));
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: Inventory) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Inventory) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const openStockAction = useCallback((row: Inventory, type: StockMovementType) => {
    setStockAction({ inventory: row, type });
  }, []);

  const openMovements = useCallback((row: Inventory) => {
    setMovementsTarget(row);
  }, []);

  const columns = useMemo(() => {
    type Row = Inventory;
    return [
      {
        header: "Inventaris",
        accessor: "name" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-on-surface">{row.name}</p>
            <p className="text-xs text-on-surface-variant">{row.code}</p>
          </div>
        ),
      },
      {
        header: "Kategori",
        accessor: "category" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">
            {CATEGORY_FILTER_OPTIONS.find((o) => o.value === row.category)?.label ??
              row.category}
          </span>
        ),
      },
      {
        header: "Stok",
        accessor: "quantity" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex min-w-[90px] flex-col items-center gap-1">
            <span className="whitespace-nowrap text-sm font-medium text-on-surface">
              {row.quantity} {row.unit}
            </span>
            {row.is_low_stock && <Badge variant="danger">Stok Menipis</Badge>}
          </div>
        ),
      },
      {
        header: "Ruangan",
        accessor: "room_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">
            {roomName(row.room_id) || (row.location ? row.location : "-")}
          </span>
        ),
      },
      {
        header: "Status",
        accessor: "status" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => {
          const s = STATUS_BADGE[row.status] ?? STATUS_BADGE.active;
          return <Badge variant={s.variant}>{s.label}</Badge>;
        },
      },
      {
        header: "Transaksi Stok",
        accessor: "id" as keyof Row,
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex items-center justify-center gap-1">
            {(["stock_in", "stock_out", "adjustment"] as StockMovementType[]).map(
              (type) => {
                const config = STOCK_ACTION_CONFIG[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => openStockAction(row, type)}
                    className={`rounded-lg p-2 text-slate-500 transition-colors ${config.className}`}
                    aria-label={config.label}
                    title={config.label}
                  >
                    <config.icon className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                );
              },
            )}
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
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => openMovements(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label="Lihat riwayat transaksi"
              title="Riwayat Transaksi"
            >
              <History className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label="Edit inventaris"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus inventaris"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [openEdit, openDelete, openStockAction, openMovements, roomName]);

  const isFirstPage = meta.current_page <= 1;
  const isLastPage = meta.current_page >= meta.last_page;
  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Inventaris"
        description="Kelola barang habis pakai dan perlengkapan sekolah beserta transaksi stoknya."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah Inventaris
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
          <div className="flex flex-1 flex-col gap-1 md:min-w-[200px] md:flex-1">
            <Search
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Cari kode atau nama barang..."
            />
          </div>

          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:min-w-[180px] md:flex-1">
            <span className="whitespace-nowrap">Kategori</span>
            <AppSelect
              options={CATEGORY_FILTER_OPTIONS}
              value={categoryFilter}
              onChange={(v) => handleCategoryChange(v ?? "all")}
              placeholder="Pilih Kategori"
            />
          </label>

          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:min-w-[160px] md:flex-1">
            <span className="whitespace-nowrap">Status</span>
            <AppSelect
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(v) => handleStatusChange(v ?? "all")}
              placeholder="Pilih Status"
            />
          </label>

          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:min-w-[180px] md:flex-1">
            <span className="whitespace-nowrap">Level Stok</span>
            <AppSelect
              options={LOW_STOCK_FILTER_OPTIONS}
              value={lowStockFilter}
              onChange={(v) => handleLowStockChange(v ?? "all")}
              placeholder="Pilih Level Stok"
            />
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data inventaris.</p>
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
                  Belum ada inventaris.
                </div>
              ) : (
                data.map((row) => {
                  const s = STATUS_BADGE[row.status] ?? STATUS_BADGE.active;
                  return (
                    <div
                      key={row.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-on-surface">{row.name}</p>
                          <p className="mt-0.5 text-xs text-on-surface-variant">
                            {row.code}
                            {roomName(row.room_id)
                              ? ` · ${roomName(row.room_id)}`
                              : ""}
                          </p>
                          <p className="mt-1 text-sm font-medium text-on-surface">
                            {row.quantity} {row.unit}
                            <span className="ml-2 text-xs font-normal text-slate-500">
                              (min. {row.minimum_stock})
                            </span>
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={s.variant}>{s.label}</Badge>
                          {row.is_low_stock && (
                            <Badge variant="danger">Stok Menipis</Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-1">
                          {(["stock_in", "stock_out", "adjustment"] as StockMovementType[]).map(
                            (type) => {
                              const config = STOCK_ACTION_CONFIG[type];
                              return (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => openStockAction(row, type)}
                                  className={`rounded-lg p-2 text-slate-500 transition-colors ${config.className}`}
                                  aria-label={config.label}
                                >
                                  <config.icon className="h-4 w-4" strokeWidth={1.75} />
                                </button>
                              );
                            },
                          )}
                          <button
                            type="button"
                            onClick={() => openMovements(row)}
                            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
                            aria-label="Lihat riwayat transaksi"
                          >
                            <History className="h-4 w-4" strokeWidth={1.75} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
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
                emptyMessage="Belum ada inventaris."
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

      <InventoryForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <InventoryDeleteDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setToDelete(null);
        }}
        onDeleted={handleDeleted}
        data={toDelete}
      />

      <StockActionDialog
        open={Boolean(stockAction.inventory)}
        onClose={() => setStockAction({ inventory: null, type: "adjustment" })}
        onCompleted={handleStockCompleted}
        inventory={stockAction.inventory}
        type={stockAction.type}
      />

      <MovementsDialog
        open={Boolean(movementsTarget)}
        onClose={() => setMovementsTarget(null)}
        inventory={movementsTarget}
      />
    </PageContainer>
  );
}