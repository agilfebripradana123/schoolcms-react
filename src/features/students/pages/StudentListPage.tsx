import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Plus, Pencil, Trash2 } from "lucide-react";
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
import { studentService } from "../api/student.service";
import type { Student } from "../api/types";
import StudentForm from "../components/StudentForm";
import StudentDetail from "../components/StudentDetail";

const PER_PAGE = 10;

const SORT_OPTIONS = [
  { value: "nama-az", label: "Nama A–Z" },
  { value: "nama-za", label: "Nama Z–A" },
];

export default function StudentListPage() {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("nama-az");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [detail, setDetail] = useState<Student | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Student | null>(null);

  const fetchList = useCallback(() => {
    let active = true;

    studentService
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
        case "nama-za":
          return (b.name ?? "").localeCompare(a.name ?? "", "id");
        default:
          return (a.name ?? "").localeCompare(b.name ?? "", "id");
      }
    });
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((s) =>
      [s.name, s.nisn, s.nis, s.birth_place, s.phone]
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
      await studentService.remove(toDelete.id);
      toast.warning(`Data siswa ${toDelete.name} berhasil dihapus.`);
      setDeleteOpen(false);
      setToDelete(null);
      setLoading(true);
      setError(null);
      fetchList();
    } catch (err) {
      toast.error("Gagal menghapus data siswa", {
        description: toApiError(err).message,
      });
    }
  }, [toDelete, fetchList]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: Student) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Student) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const openDetail = useCallback((row: Student) => {
    setDetail(row);
  }, []);

  const columns = useMemo(() => {
    type Row = Student;
    return [
      {
        header: "NISN / NIS",
        accessor: "nisn" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <div>
            <p className="font-semibold text-on-surface">{row.nisn}</p>
            <p className="text-xs text-on-surface-variant">NIS: {row.nis}</p>
          </div>
        ),
      },
      {
        header: "Nama Siswa",
        accessor: "name" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <span className="font-medium text-on-surface">{row.name}</span>
        ),
      },
      {
        header: "L/P",
        accessor: "gender" as keyof Row,
        headerClassName: "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_val: unknown, row: Row) => (
          <Badge variant={row.gender === "L" ? "primary" : "neutral"}>
            {row.gender === "L" ? "Laki-laki" : "Perempuan"}
          </Badge>
        ),
      },
      {
        header: "Tempat, Tgl Lahir",
        accessor: "birth_place" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <span className="text-sm text-on-surface-variant">
            {row.birth_place}, {row.birth_date ? row.birth_date.substring(0, 10) : "-"}
          </span>
        ),
      },
      {
        header: "Telepon",
        accessor: "phone" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <span className="text-sm text-on-surface-variant">{row.phone ?? "-"}</span>
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
              onClick={() => openDetail(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label={`Lihat detail ${row.name}`}
            >
              <Eye className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label={`Edit ${row.name}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label={`Hapus ${row.name}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        ),
      },
    ];
  }, [openDetail, openEdit, openDelete]);

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Data Siswa"
        description="Kelola seluruh biodata dan informasi siswa terdaftar."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah Siswa
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <Search
                value={search}
                onChange={handleSearchChange}
                placeholder="Cari nama / NISN / NIS..."
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
                  {search ? "Tidak ada siswa yang cocok." : "Belum ada data siswa."}
                </div>
              ) : (
                pageData.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-on-surface">{row.name}</p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {row.nisn} · NIS {row.nis}
                        </p>
                      </div>
                      <Badge variant={row.gender === "L" ? "primary" : "neutral"}>
                        {row.gender === "L" ? "L" : "P"}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-on-surface-variant">
                      <p>{row.birth_place}, {row.birth_date ? row.birth_date.substring(0, 10) : "-"}</p>
                      <p>{row.phone ?? "-"}</p>
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openDetail(row)}
                      >
                        <Eye className="h-4 w-4" /> Detail
                      </Button>
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

            {/* Tabel untuk desktop */}
            <div className="hidden sm:block">
              <DataTable
                columns={columns}
                data={pageData}
                loading={loading}
                emptyMessage={search ? "Tidak ada siswa yang cocok." : "Belum ada data siswa."}
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

      <StudentForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <StudentDetail
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        student={detail}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Data Siswa"
        description={`Apakah Anda yakin ingin menghapus data siswa ${toDelete?.name || ""}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        destructive
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  );
}