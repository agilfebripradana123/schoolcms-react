import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";
import type { ApiError } from "@/types";
import { assetService } from "../api/asset.service";
import { roomService } from "../api/room.service";
import type {
  ActiveStatus,
  Asset,
  AssetCondition,
  Room,
} from "../api/types";
import AssetForm from "../components/asset/AssetForm";
import AssetDeleteDialog from "../components/asset/AssetDeleteDialog";
import Pagination from "../../../components/ui/Pagination";

const PER_PAGE = 10;

const CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "Semua Kategori" },
  { value: "electronics", label: "Elektronik" },
  { value: "furniture", label: "Furnitur" },
  { value: "lab_equipment", label: "Peralatan Lab" },
  { value: "sports", label: "Olahraga" },
  { value: "teaching_aids", label: "Alat Peraga" },
  { value: "office", label: "Perkantoran" },
  { value: "other", label: "Lainnya" },
];

const CONDITION_FILTER_OPTIONS = [
  { value: "all", label: "Semua Kondisi" },
  { value: "good", label: "Baik" },
  { value: "fair", label: "Cukup" },
  { value: "poor", label: "Kurang" },
  { value: "damaged", label: "Rusak" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
];

const STATUS_BADGE: Record<ActiveStatus, { label: string; variant: "success" | "neutral" }> = {
  active: { label: "Aktif", variant: "success" },
  inactive: { label: "Nonaktif", variant: "neutral" },
};

const CONDITION_BADGE: Record<
  AssetCondition,
  { label: string; variant: "success" | "warning" | "danger" }
> = {
  good: { label: "Baik", variant: "success" },
  fair: { label: "Cukup", variant: "warning" },
  poor: { label: "Kurang", variant: "warning" },
  damaged: { label: "Rusak", variant: "danger" },
};

interface QueryState {
  search: string | undefined;
  category: string | undefined;
  condition: string | undefined;
  status: string | undefined;
  room_id: number | undefined;
  page: number;
}

export default function AssetsPage() {
  const [data, setData] = useState<Asset[]>([]);
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
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [roomOptions, setRoomOptions] = useState<Room[]>([]);

  const [query, setQuery] = useState<QueryState>({
    search: undefined,
    category: undefined,
    condition: undefined,
    status: undefined,
    room_id: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Asset | null>(null);

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

    assetService
      .list({
        search: query.search,
        category: query.category,
        condition: query.condition,
        status: query.status,
        room_id: query.room_id,
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
        toast.error("Gagal memuat data aset", {
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

  const handleConditionChange = useCallback((value: string) => {
    setConditionFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      condition: value === "all" ? undefined : value,
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

  const handleRoomChange = useCallback((value: string) => {
    setRoomFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      room_id: value === "all" ? undefined : Number(value),
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

  const openEdit = useCallback((row: Asset) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Asset) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = Asset;
    return [
      {
        header: "Aset",
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
            {CATEGORY_FILTER_OPTIONS.find((o) => o.value === row.category)?.label ?? row.category}
          </span>
        ),
      },
      {
        header: "Kondisi",
        accessor: "condition" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => {
          const c = CONDITION_BADGE[row.condition] ?? CONDITION_BADGE.good;
          return <Badge variant={c.variant}>{c.label}</Badge>;
        },
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
        header: "Harga",
        accessor: "purchase_price" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) =>
          row.purchase_price !== null && row.purchase_price !== undefined ? (
            <span className="text-sm text-slate-700">
              {formatCurrency(row.purchase_price)}
            </span>
          ) : (
            <span className="text-sm text-slate-400">-</span>
          ),
      },
      {
        header: "Status",
        accessor: "status" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => {
          const s = STATUS_BADGE[row.status] ?? STATUS_BADGE.active;
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
              aria-label="Edit aset"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus aset"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [openEdit, openDelete, roomName]);


  const roomFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Ruangan" },
      ...roomOptions.map((room) => ({ value: String(room.id), label: room.name })),
    ],
    [roomOptions],
  );

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Aset"
        description="Kelola inventaris aset sekolah meliputi peralatan, furnitur, dan lainnya."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah Aset
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full gap-2 sm:max-w-xs">
            <Search
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Cari kode atau nama aset..."
            />
          </div>
        </div>

          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 *:md:gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
              <span className="whitespace-nowrap">Kategori</span>
              <AppSelect
                options={CATEGORY_FILTER_OPTIONS}
                value={categoryFilter}
                onChange={(v) => handleCategoryChange(v ?? "all")}
                placeholder="Pilih Kategori"
              />
            </label>

            <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
              <span className="whitespace-nowrap">Kondisi</span>
              <AppSelect
                options={CONDITION_FILTER_OPTIONS}
                value={conditionFilter}
                onChange={(v) => handleConditionChange(v ?? "all")}
                placeholder="Pilih Kondisi"
              />
            </label>

            <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
              <span className="whitespace-nowrap">Status</span>
              <AppSelect
                options={STATUS_FILTER_OPTIONS}
                value={statusFilter}
                onChange={(v) => handleStatusChange(v ?? "all")}
                placeholder="Pilih Status"
              />
            </label>

            <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
              <span className="whitespace-nowrap">Ruangan</span>
              <AppSelect
                options={roomFilterOptions}
                value={roomFilter}
                onChange={(v) => handleRoomChange(v ?? "all")}
                placeholder="Pilih Ruangan"
              />
            </label>
          </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data aset.</p>
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
                  Belum ada aset.
                </div>
              ) : (
                data.map((row) => {
                  const s = STATUS_BADGE[row.status] ?? STATUS_BADGE.active;
                  const c = CONDITION_BADGE[row.condition] ?? CONDITION_BADGE.good;
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
                          <p className="mt-1 text-xs text-slate-500">
                            {row.category &&
                              CATEGORY_FILTER_OPTIONS.find((o) => o.value === row.category)
                                ?.label}
                            {row.quantity ? ` · ${row.quantity} unit` : ""}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={s.variant}>{s.label}</Badge>
                          <Badge variant={c.variant}>{c.label}</Badge>
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
                data={data}
                loading={loading}
                emptyMessage="Belum ada aset."
              />
            </div>
          </>
        )}

        <Pagination meta={meta} onPageChange={goToPage} loading={loading} error={error} />
      </Card>

      <AssetForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <AssetDeleteDialog
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