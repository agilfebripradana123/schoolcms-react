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
import { teacherAttendanceService } from "../api/teacher-attendance.service";
import { formatTeacherName, type TeacherAttendance } from "../api/types";
import TeacherAttendanceForm from "../components/TeacherAttendanceForm";

const PER_PAGE = 10;

const SORT_OPTIONS = [
  { value: "tanggal-terbaru", label: "Tanggal Terbaru" },
  { value: "tanggal-terlama", label: "Tanggal Terlama" },
  { value: "nama-az", label: "Nama A–Z" },
  { value: "nama-za", label: "Nama Z–A" },
];

const STATUS_META: Record<string, { label: string; variant: "success" | "warning" | "danger" | "primary" | "neutral" }> = {
  hadir: { label: "Hadir", variant: "success" },
  izin: { label: "Izin", variant: "neutral" },
  sakit: { label: "Sakit", variant: "primary" },
  terlambat: { label: "Terlambat", variant: "warning" },
  alpa: { label: "Alpa", variant: "danger" },
};

function teacherName(a: TeacherAttendance): string {
  return a.teacher ? formatTeacherName(a.teacher) : `#${a.teacher_id}`;
}

export default function TeacherAttendanceListPage() {
  const [data, setData] = useState<TeacherAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("tanggal-terbaru");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TeacherAttendance | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<TeacherAttendance | null>(null);

  const fetchList = useCallback(() => {
    let active = true;

    teacherAttendanceService
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
        case "tanggal-terlama":
          return (a.date ?? "").localeCompare(b.date ?? "");
        case "nama-az":
          return (a.teacher?.full_name ?? "").localeCompare(b.teacher?.full_name ?? "", "id");
        case "nama-za":
          return (b.teacher?.full_name ?? "").localeCompare(a.teacher?.full_name ?? "", "id");
        default:
          return (b.date ?? "").localeCompare(a.date ?? "");
      }
    });
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((a) =>
      [teacherName(a), a.date, a.status, a.notes]
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
    setLoading(true);
    setError(null);
    fetchList();
  }, [fetchList]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!toDelete) return;
    try {
      await teacherAttendanceService.remove(toDelete.id);
      toast.warning("Kehadiran guru berhasil dihapus.");
      setDeleteOpen(false);
      setToDelete(null);
      setLoading(true);
      setError(null);
      fetchList();
    } catch (err) {
      toast.error("Gagal menghapus kehadiran", {
        description: toApiError(err).message,
      });
    }
  }, [toDelete, fetchList]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: TeacherAttendance) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: TeacherAttendance) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = TeacherAttendance;
    return [
      {
        header: "Guru",
        accessor: "teacher" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <div>
            <p className="font-medium text-on-surface">
              {row.teacher ? formatTeacherName(row.teacher) : `#${row.teacher_id}`}
            </p>
            {row.teacher?.nip && (
              <p className="text-xs text-on-surface-variant">NIP: {row.teacher.nip}</p>
            )}
          </div>
        ),
      },
      {
        header: "Tanggal",
        accessor: "date" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <span className="text-sm text-on-surface-variant">
            {row.date ? row.date.substring(0, 10) : "-"}
          </span>
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
        header: "Jam Masuk",
        accessor: "check_in" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <span className="text-sm text-on-surface-variant">
            {row.check_in ? row.check_in.substring(0, 5) : "-"}
          </span>
        ),
      },
      {
        header: "Jam Pulang",
        accessor: "check_out" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <span className="text-sm text-on-surface-variant">
            {row.check_out ? row.check_out.substring(0, 5) : "-"}
          </span>
        ),
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
              aria-label={`Edit kehadiran ${teacherName(row)}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus kehadiran"
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
        title="Kehadiran Guru"
        description="Kelola rekap kehadiran guru setiap hari."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah Kehadiran
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <Search
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari guru / tanggal / status..."
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
                <div className="py-10 text-center text-slate-500">
                  Memuat data...
                </div>
              ) : pageData.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  {search
                    ? "Tidak ada kehadiran yang cocok."
                    : "Belum ada data kehadiran."}
                </div>
              ) : (
                pageData.map((row) => {
                  const meta = STATUS_META[row.status ?? ""];
                  return (
                    <div
                      key={row.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-on-surface">
                            {row.teacher
                              ? formatTeacherName(row.teacher)
                              : `#${row.teacher_id}`}
                          </p>
                          <p className="mt-0.5 text-xs text-on-surface-variant">
                            {row.date ? row.date.substring(0, 10) : "-"}
                          </p>
                        </div>
                        {meta ? (
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        ) : (
                          <span className="text-sm text-on-surface-variant">
                            {row.status ?? "-"}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 space-y-1 text-sm text-on-surface-variant">
                        <p>
                          {row.check_in ? `${row.check_in.substring(0, 5)} – ` : ""}
                          {row.check_out ? row.check_out.substring(0, 5) : "-"}
                        </p>
                        {row.notes && <p>{row.notes}</p>}
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

            {/* Tabel untuk desktop */}
            <div className="hidden sm:block">
              <DataTable
                columns={columns}
                data={pageData}
                loading={loading}
                emptyMessage={
                  search
                    ? "Tidak ada kehadiran yang cocok."
                    : "Belum ada data kehadiran."
                }
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

      <TeacherAttendanceForm
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
        title="Hapus Kehadiran"
        description={`Apakah Anda yakin ingin menghapus kehadiran ${toDelete ? teacherName(toDelete) : ""} pada ${toDelete?.date ? toDelete.date.substring(0, 10) : ""}?`}
        confirmText="Hapus"
        cancelText="Batal"
        destructive
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  );
}