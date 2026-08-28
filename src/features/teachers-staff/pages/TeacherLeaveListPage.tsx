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
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { teacherLeaveService } from "../api/teacher-leave.service";
import { formatTeacherName, type TeacherLeave } from "../api/types";
import TeacherLeaveForm from "../components/TeacherLeaveForm";

const PER_PAGE = 10;

const SORT_OPTIONS = [
  { value: "mulai-terbaru", label: "Mulai Terbaru" },
  { value: "mulai-terlama", label: "Mulai Terlama" },
  { value: "nama-az", label: "Nama A–Z" },
  { value: "nama-za", label: "Nama Z–A" },
];

const LEAVE_TYPE_META: Record<string, { label: string; variant: "success" | "warning" | "danger" | "primary" | "neutral" }> = {
  izin: { label: "Izin", variant: "neutral" },
  sakit: { label: "Sakit", variant: "primary" },
  cuti: { label: "Cuti", variant: "warning" },
  dinas: { label: "Dinas", variant: "success" },
};

const STATUS_META: Record<string, { label: string; variant: "success" | "warning" | "danger" | "primary" | "neutral" }> = {
  menunggu: { label: "Menunggu", variant: "warning" },
  disetujui: { label: "Disetujui", variant: "success" },
  ditolak: { label: "Ditolak", variant: "danger" },
};

function teacherName(t: TeacherLeave): string {
  return t.teacher ? formatTeacherName(t.teacher) : `#${t.teacher_id}`;
}

export default function TeacherLeaveListPage() {
  const [data, setData] = useState<TeacherLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("mulai-terbaru");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TeacherLeave | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<TeacherLeave | null>(null);

  const fetchList = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);

    teacherLeaveService
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

  // Client-side search
  const filtered = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      switch (sort) {
        case "mulai-terlama":
          return (a.start_date ?? "").localeCompare(b.start_date ?? "");
        case "nama-az":
          return (a.teacher?.full_name ?? "").localeCompare(b.teacher?.full_name ?? "", "id");
        case "nama-za":
          return (b.teacher?.full_name ?? "").localeCompare(a.teacher?.full_name ?? "", "id");
        default:
          return (b.start_date ?? "").localeCompare(a.start_date ?? "");
      }
    });
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((l) =>
      [teacherName(l), l.leave_type, l.status, l.reason, l.start_date, l.end_date]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [data, search, sort]);

  // Client-side pagination
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
    fetchList();
  }, [fetchList]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!toDelete) return;
    try {
      await teacherLeaveService.remove(toDelete.id);
      toast.warning("Data cuti guru berhasil dihapus.");
      setDeleteOpen(false);
      setToDelete(null);
      fetchList();
    } catch (err) {
      toast.error("Gagal menghapus data cuti", {
        description: toApiError(err).message,
      });
    }
  }, [toDelete, fetchList]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: TeacherLeave) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: TeacherLeave) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = TeacherLeave;
    return [
      {
        header: "Guru",
        accessor: "teacher" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <div>
            <p className="font-medium text-on-surface">{teacherName(row)}</p>
            {row.teacher?.nip && (
              <p className="text-xs text-on-surface-variant">NIP: {row.teacher.nip}</p>
            )}
          </div>
        ),
      },
      {
        header: "Jenis",
        accessor: "leave_type" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_val: unknown, row: Row) => {
          const meta = LEAVE_TYPE_META[row.leave_type ?? ""];
          if (!meta) {
            return <span className="text-sm text-on-surface-variant">{row.leave_type ?? "-"}</span>;
          }
          return <Badge variant={meta.variant}>{meta.label}</Badge>;
        },
      },
      {
        header: "Periode",
        accessor: "start_date" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <span className="text-sm text-on-surface-variant">
            {row.start_date ? row.start_date.substring(0, 10) : "-"}
            {row.end_date && row.end_date !== row.start_date
              ? ` s.d. ${row.end_date.substring(0, 10)}`
              : ""}
          </span>
        ),
      },
      {
        header: "Alasan",
        accessor: "reason" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <span className="text-sm text-on-surface-variant">{row.reason ?? "-"}</span>
        ),
      },
      {
        header: "Status",
        accessor: "status" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_val: unknown, row: Row) => {
          const meta = STATUS_META[row.status ?? ""];
          if (!meta) {
            return <span className="text-sm text-on-surface-variant">{row.status ?? "-"}</span>;
          }
          return <Badge variant={meta.variant}>{meta.label}</Badge>;
        },
      },
      {
        header: "Aksi",
        accessor: "id" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_val: unknown, row: Row) => (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label={`Edit cuti ${teacherName(row)}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus cuti"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        ),
      },
    ];
  }, [openEdit, openDelete]);

  const from = filtered.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1;
  const to = Math.min(safePage * PER_PAGE, filtered.length);

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Cuti Guru"
        description="Kelola pengajuan cuti dan izin guru."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah Cuti
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <Search
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari guru / jenis / status..."
            />
          </div>
          <div className="w-full sm:w-56">
            <SortSelect
              value={sort}
              options={SORT_OPTIONS}
              onChange={handleSortChange}
            />
          </div>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">{error.message}</p>
            <Button variant="secondary" onClick={fetchList}>
              Muat Ulang
            </Button>
          </div>
        ) : (
          <>
            {/* Kartu untuk mobile */}
            <div className="space-y-3 sm:hidden">
              {loading ? (
                <div className="py-10 text-center text-slate-500">
                  Memuat data...
                </div>
              ) : pageData.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  {search ? "Tidak ada cuti yang cocok." : "Belum ada data cuti."}
                </div>
              ) : (
                pageData.map((row) => {
                  const sMeta = STATUS_META[row.status ?? ""];
                  return (
                    <div
                      key={row.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-on-surface">
                            {teacherName(row)}
                          </p>
                          <p className="mt-0.5 text-xs text-on-surface-variant">
                            {row.leave_type ?? "-"} ·{" "}
                            {row.start_date ? row.start_date.substring(0, 10) : "-"}
                            {row.end_date && row.end_date !== row.start_date
                              ? ` s.d. ${row.end_date.substring(0, 10)}`
                              : ""}
                          </p>
                        </div>
                        {sMeta ? (
                          <Badge variant={sMeta.variant}>{sMeta.label}</Badge>
                        ) : (
                          <span className="text-sm text-on-surface-variant">
                            {row.status ?? "-"}
                          </span>
                        )}
                      </div>
                      {row.reason && (
                        <p className="mt-2 text-sm text-on-surface-variant">
                          {row.reason}
                        </p>
                      )}
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

            {/* Tabel untuk desktop */}
            <div className="hidden sm:block">
              <DataTable
                columns={columns}
                data={pageData}
                loading={loading}
                emptyMessage={
                  search ? "Tidak ada cuti yang cocok." : "Belum ada data cuti."
                }
              />
            </div>
          </>
        )}

        {!error && !loading && filtered.length > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-on-surface-variant">
              Menampilkan {from}-{to} dari {filtered.length} data
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => goToPage(safePage - 1)}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-on-surface-variant">
                Halaman {safePage} dari {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => goToPage(safePage + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      <TeacherLeaveForm
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
        title="Hapus Data Cuti"
        description={`Apakah Anda yakin ingin menghapus cuti ${toDelete ? teacherName(toDelete) : ""}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        destructive
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  );
}