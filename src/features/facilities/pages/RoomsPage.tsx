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
import type { ApiError } from "@/types";
import { roomService } from "../api/room.service";
import type { ActiveStatus, Room } from "../api/types";
import RoomForm from "../components/room/RoomForm";
import RoomDeleteDialog from "../components/room/RoomDeleteDialog";
import Pagination from "@/components/ui/Pagination";

const PER_PAGE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
];

const COMPUTER_FILTER_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "true", label: "Ada Komputer" },
  { value: "false", label: "Tanpa Komputer" },
];

const STATUS_BADGE: Record<ActiveStatus, { label: string; variant: "success" | "neutral" }> = {
  active: { label: "Aktif", variant: "success" },
  inactive: { label: "Nonaktif", variant: "neutral" },
};

interface QueryState {
  search: string | undefined;
  status: string | undefined;
  has_computer: boolean | undefined;
  page: number;
}

export default function RoomsPage() {
  const [data, setData] = useState<Room[]>([]);
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
  const [computerFilter, setComputerFilter] = useState<string>("all");

  const [query, setQuery] = useState<QueryState>({
    search: undefined,
    status: undefined,
    has_computer: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Room | null>(null);

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

    roomService
      .list({
        search: query.search,
        status: query.status,
        has_computer: query.has_computer,
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
        toast.error("Gagal memuat data ruangan", {
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

  const handleComputerChange = useCallback((value: string) => {
    setComputerFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      has_computer: value === "all" ? undefined : value === "true",
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

  const openEdit = useCallback((row: Room) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Room) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = Room;
    return [
      {
        header: "Kode",
        accessor: "code" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm font-medium text-on-surface">{row.code}</span>
        ),
      },
      {
        header: "Nama Ruangan",
        accessor: "name" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-on-surface">{row.name}</p>
            {row.location && (
              <p className="text-xs text-on-surface-variant">{row.location}</p>
            )}
          </div>
        ),
      },
      {
        header: "Kapasitas",
        accessor: "capacity" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">{row.capacity} orang</span>
        ),
      },
      {
        header: "Komputer",
        accessor: "has_computer" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) =>
          row.has_computer ? (
            <Badge variant="primary">Ada</Badge>
          ) : (
            <span className="text-sm text-slate-500">-</span>
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
              aria-label="Edit ruangan"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus ruangan"
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
        title="Ruangan"
        description="Kelola data ruangan untuk kegiatan belajar dan mengajar."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah Ruangan
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end *:md:gap-3">
          <div className="flex flex-1 flex-col gap-1 md:min-w-[200px] md:flex-1">
            <Search
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Cari kode atau nama ruangan..."
            />
          </div>

          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:min-w-[170px] md:flex-1">
            <span className="whitespace-nowrap">Status</span>
            <AppSelect
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(v) => handleStatusChange(v ?? "all")}
              placeholder="Pilih Status"
            />
          </label>

          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:min-w-[200px] md:flex-1">
            <span className="whitespace-nowrap">Komputer</span>
            <AppSelect
              options={COMPUTER_FILTER_OPTIONS}
              value={computerFilter}
              onChange={(v) => handleComputerChange(v ?? "all")}
              placeholder="Pilih Fasilitas Komputer"
            />
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data ruangan.</p>
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
                  Belum ada ruangan.
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
                            {row.location ? ` · ${row.location}` : ""}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            Kapasitas {row.capacity} orang
                            {row.has_computer ? " · Ada komputer" : ""}
                          </p>
                        </div>
                        <Badge variant={s.variant}>{s.label}</Badge>
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
                emptyMessage="Belum ada ruangan."
              />
            </div>
          </>
        )}

        <Pagination meta={meta} onPageChange={goToPage} loading={loading} error={error} />
      </Card>

      <RoomForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <RoomDeleteDialog
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