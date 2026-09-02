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
import { maintenanceService } from "../api/maintenance.service";
import { assetService } from "../api/asset.service";
import { roomService } from "../api/room.service";
import type {
  Asset,
  Maintenance,
  MaintenancePriority,
  MaintenanceStatus,
  Room,
} from "../api/types";
import MaintenanceForm from "../components/maintenance/MaintenanceForm";
import MaintenanceDeleteDialog from "../components/maintenance/MaintenanceDeleteDialog";

const PER_PAGE = 10;

const TYPE_FILTER_OPTIONS = [
  { value: "all", label: "Semua Jenis" },
  { value: "corrective", label: "Korektif" },
  { value: "preventive", label: "Preventif" },
  { value: "emergency", label: "Darurat" },
  { value: "inspection", label: "Inspeksi" },
];

const PRIORITY_FILTER_OPTIONS = [
  { value: "all", label: "Semua Prioritas" },
  { value: "low", label: "Rendah" },
  { value: "medium", label: "Sedang" },
  { value: "high", label: "Tinggi" },
  { value: "urgent", label: "Sangat Tinggi" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "pending", label: "Menunggu" },
  { value: "in_progress", label: "Dalam Proses" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

const STATUS_BADGE: Record<
  MaintenanceStatus,
  { label: string; variant: "primary" | "success" | "warning" | "neutral" }
> = {
  pending: { label: "Menunggu", variant: "warning" },
  in_progress: { label: "Dalam Proses", variant: "primary" },
  completed: { label: "Selesai", variant: "success" },
  cancelled: { label: "Dibatalkan", variant: "neutral" },
};

const PRIORITY_BADGE: Record<
  MaintenancePriority,
  { label: string; variant: "secondary" | "success" | "warning" | "danger" }
> = {
  low: { label: "Rendah", variant: "secondary" },
  medium: { label: "Sedang", variant: "success" },
  high: { label: "Tinggi", variant: "warning" },
  urgent: { label: "Sangat Tinggi", variant: "danger" },
};

interface QueryState {
  search: string | undefined;
  status: string | undefined;
  priority: string | undefined;
  maintenance_type: string | undefined;
  page: number;
}

export default function MaintenancesPage() {
  const [data, setData] = useState<Maintenance[]>([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: PER_PAGE,
    total: 0,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [assets, setAssets] = useState<Asset[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [query, setQuery] = useState<QueryState>({
    search: undefined,
    status: undefined,
    priority: undefined,
    maintenance_type: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Maintenance | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Maintenance | null>(null);

  useEffect(() => {
    assetService
      .list({ per_page: 100 })
      .then((res) => setAssets(res.data))
      .catch(() => setAssets([]));
    roomService
      .list({ per_page: 100 })
      .then((res) => setRooms(res.data))
      .catch(() => setRooms([]));
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

    maintenanceService
      .list({
        search: query.search,
        status: query.status,
        priority: query.priority,
        maintenance_type: query.maintenance_type,
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
        toast.error("Gagal memuat data pemeliharaan", {
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

  const assetName = useCallback(
    (assetId: number | null | undefined) =>
      assets.find((asset) => asset.id === assetId)?.name ?? "",
    [assets],
  );

  const roomName = useCallback(
    (roomId: number | null | undefined) =>
      rooms.find((room) => room.id === roomId)?.name ?? "",
    [rooms],
  );

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

  const handlePriorityChange = useCallback((value: string) => {
    setPriorityFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      priority: value === "all" ? undefined : value,
      page: 1,
    }));
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setTypeFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      maintenance_type: value === "all" ? undefined : value,
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

  const openEdit = useCallback((row: Maintenance) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Maintenance) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = Maintenance;
    return [
      {
        header: "Pemeliharaan",
        accessor: "title" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-on-surface">{row.title}</p>
            <p className="text-xs text-on-surface-variant">
              {row.code}
              {assetName(row.asset_id) ? ` · ${assetName(row.asset_id)}` : ""}
            </p>
          </div>
        ),
      },
      {
        header: "Jenis",
        accessor: "maintenance_type" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">
            {TYPE_FILTER_OPTIONS.find((o) => o.value === row.maintenance_type)?.label ??
              row.maintenance_type}
          </span>
        ),
      },
      {
        header: "Prioritas",
        accessor: "priority" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => {
          const p = PRIORITY_BADGE[row.priority] ?? PRIORITY_BADGE.medium;
          return <Badge variant={p.variant}>{p.label}</Badge>;
        },
      },
      {
        header: "Status",
        accessor: "status" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => {
          const s = STATUS_BADGE[row.status] ?? STATUS_BADGE.pending;
          return <Badge variant={s.variant}>{s.label}</Badge>;
        },
      },
      {
        header: "Jadwal",
        accessor: "scheduled_date" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="whitespace-nowrap text-sm text-slate-700">
            {row.scheduled_date || "-"}
          </span>
        ),
      },
      {
        header: "Lokasi",
        accessor: "room_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">
            {roomName(row.room_id) || "-"}
          </span>
        ),
      },
      {
        header: "Biaya",
        accessor: "actual_cost" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) =>
          row.actual_cost !== null && row.actual_cost !== undefined ? (
            <span className="whitespace-nowrap text-sm text-slate-700">
              {formatCurrency(row.actual_cost)}
            </span>
          ) : row.estimated_cost !== null && row.estimated_cost !== undefined ? (
            <span className="whitespace-nowrap text-sm text-slate-400">
              Est. {formatCurrency(row.estimated_cost)}
            </span>
          ) : (
            <span className="text-sm text-slate-400">-</span>
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
              aria-label="Edit pemeliharaan"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus pemeliharaan"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [openEdit, openDelete, assetName, roomName]);

  const isFirstPage = meta.current_page <= 1;
  const isLastPage = meta.current_page >= meta.last_page;
  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Pemeliharaan"
        description="Kelola jadwal pemeliharaan dan perbaikan aset sekolah."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah Pemeliharaan
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end *:md:gap-3">
          <div className="flex flex-1 flex-col gap-1 md:min-w-[200px] md:flex-1">
            <Search
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Cari kode atau judul..."
            />
          </div>

          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:min-w-[170px] md:flex-1">
            <span className="whitespace-nowrap">Jenis</span>
            <AppSelect
              options={TYPE_FILTER_OPTIONS}
              value={typeFilter}
              onChange={(v) => handleTypeChange(v ?? "all")}
              placeholder="Pilih Jenis"
            />
          </label>

          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:min-w-[170px] md:flex-1">
            <span className="whitespace-nowrap">Prioritas</span>
            <AppSelect
              options={PRIORITY_FILTER_OPTIONS}
              value={priorityFilter}
              onChange={(v) => handlePriorityChange(v ?? "all")}
              placeholder="Pilih Prioritas"
            />
          </label>

          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:min-w-[170px] md:flex-1">
            <span className="whitespace-nowrap">Status</span>
            <AppSelect
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(v) => handleStatusChange(v ?? "all")}
              placeholder="Pilih Status"
            />
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data pemeliharaan.</p>
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
                  Belum ada pemeliharaan.
                </div>
              ) : (
                data.map((row) => {
                  const s = STATUS_BADGE[row.status] ?? STATUS_BADGE.pending;
                  const p = PRIORITY_BADGE[row.priority] ?? PRIORITY_BADGE.medium;
                  return (
                    <div
                      key={row.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-on-surface">{row.title}</p>
                          <p className="mt-0.5 text-xs text-on-surface-variant">
                            {row.code}
                            {assetName(row.asset_id)
                              ? ` · ${assetName(row.asset_id)}`
                              : ""}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.scheduled_date
                              ? `Jadwal: ${row.scheduled_date}`
                              : "Belum ada jadwal"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={s.variant}>{s.label}</Badge>
                          <Badge variant={p.variant}>{p.label}</Badge>
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
                emptyMessage="Belum ada pemeliharaan."
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

      <MaintenanceForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <MaintenanceDeleteDialog
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