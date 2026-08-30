import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import AppSelect from "@/components/ui/Select";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { classStudentService } from "../api/class-student.service";
import { classService } from "../api/class.service";
import { academicYearService } from "../api/academic-year.service";
import { studentService } from "@/features/students/api/student.service";
import type {
  AcademicYear,
  ClassStudent,
  ClassStudentStatus,
  SchoolClass,
} from "../api/types";
import type { Student } from "@/features/students/api/types";
import ClassStudentForm from "../components/class-student/ClassStudentForm";
import ClassStudentDeleteDialog from "../components/class-student/ClassStudentDeleteDialog";

const PER_PAGE = 10;

interface QueryState {
  class_id: number | undefined;
  student_id: number | undefined;
  academic_year_id: number | undefined;
  status: ClassStudentStatus | undefined;
  page: number;
}

const STATUS_META: Record<ClassStudentStatus, { label: string; variant: "success" | "warning" | "secondary" }> = {
  active: { label: "Aktif", variant: "success" },
  moved: { label: "Pindah", variant: "warning" },
  graduated: { label: "Lulus", variant: "secondary" },
};

export default function ClassStudentsPage() {
  const [data, setData] = useState<ClassStudent[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);

  const [classFilter, setClassFilter] = useState<string>("all");
  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const [query, setQuery] = useState<QueryState>({
    class_id: undefined,
    student_id: undefined,
    academic_year_id: undefined,
    status: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClassStudent | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ClassStudent | null>(null);

  useEffect(() => {
    classService
      .list()
      .then((res) => setClasses(res.data))
      .catch(() => {
        toast.error("Gagal memuat data kelas");
      });
    studentService
      .list({ per_page: 100 })
      .then((res) => setStudents(res.data))
      .catch(() => {
        toast.error("Gagal memuat data siswa");
      });
    academicYearService
      .list({ per_page: 100 })
      .then((res) => setYears(res.data))
      .catch(() => {
        toast.error("Gagal memuat data tahun ajaran");
      });
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    classStudentService
      .list({
        class_id: query.class_id,
        student_id: query.student_id,
        academic_year_id: query.academic_year_id,
        status: query.status,
        page: query.page,
        per_page: PER_PAGE,
      })
      .then((res) => {
        if (!active) return;
        setData(res.data);
        setMeta(res.meta);
        setPage(res.meta.current_page);
      })
      .catch((err) => {
        if (!active) return;
        setError(toApiError(err));
        setData([]);
        toast.error("Gagal memuat data siswa kelas", {
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

  const handleClassChange = useCallback((value: string) => {
    setClassFilter(value);
    setQuery((prev) => ({
      ...prev,
      class_id: value === "all" ? undefined : Number(value),
      page: 1,
    }));
  }, []);

  const handleStudentChange = useCallback((value: string) => {
    setStudentFilter(value);
    setQuery((prev) => ({
      ...prev,
      student_id: value === "all" ? undefined : Number(value),
      page: 1,
    }));
  }, []);

  const handleYearChange = useCallback((value: string) => {
    setYearFilter(value);
    setQuery((prev) => ({
      ...prev,
      academic_year_id: value === "all" ? undefined : Number(value),
      page: 1,
    }));
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    setQuery((prev) => ({
      ...prev,
      status: value === "all" ? undefined : (value as ClassStudentStatus),
      page: 1,
    }));
  }, []);

  const goToPage = useCallback((target: number) => {
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const handleSaved = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
    setQuery((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleDeleted = useCallback(() => {
    setDeleteOpen(false);
    setToDelete(null);
    const isLastPage = page > 1 && meta.total - 1 <= (page - 1) * meta.per_page;
    setQuery((prev) => ({
      ...prev,
      page: isLastPage ? page - 1 : page,
    }));
  }, [page, meta.total, meta.per_page]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: ClassStudent) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: ClassStudent) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = ClassStudent;
    return [
      {
        header: "Kelas",
        accessor: "class" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="font-medium text-on-surface">
            {row.class?.name ?? `#${row.class_id}`}
          </span>
        ),
      },
      {
        header: "Siswa",
        accessor: "student" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">
            {row.student?.name ?? `#${row.student_id}`}
          </span>
        ),
      },
      {
        header: "Tahun Ajaran",
        accessor: "academic_year" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">
            {row.academic_year?.name ?? `#${row.academic_year_id}`}
          </span>
        ),
      },
      {
        header: "Status",
        accessor: "status" as keyof Row,
        headerClassName: "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => {
          const meta = STATUS_META[row.status] ?? { label: row.status, variant: "secondary" as const };
          return (
            <Badge
              variant={meta.variant}
              className="px-2.5 py-1 text-xs leading-4"
            >
              {meta.label}
            </Badge>
          );
        },
      },
      {
        header: "Aksi",
        accessor: "id" as keyof Row,
        headerClassName: "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label={`Edit ${row.student?.name ?? row.student_id}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label={`Hapus ${row.student?.name ?? row.student_id}`}
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

  const classFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Kelas" },
      ...classes.map((c) => ({ value: String(c.id), label: c.name })),
    ],
    [classes],
  );
  const studentFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Siswa" },
      ...students.map((s) => ({ value: String(s.id), label: s.name })),
    ],
    [students],
  );
  const yearFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Tahun Ajaran" },
      ...years.map((y) => ({ value: String(y.id), label: y.name })),
    ],
    [years],
  );
  const statusFilterOptions = [
    { value: "all", label: "Semua Status" },
    { value: "active", label: "Aktif" },
    { value: "moved", label: "Pindah" },
    { value: "graduated", label: "Lulus" },
  ];

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Peserta Didik Kelas"
        description="Kelola penempatan siswa pada setiap kelas dan tahun ajaran."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
            <span className="whitespace-nowrap">Kelas</span>
            <AppSelect
              options={classFilterOptions}
              value={classFilter}
              onChange={(v) => handleClassChange(v ?? "all")}
              placeholder="Pilih Kelas"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
            <span className="whitespace-nowrap">Siswa</span>
            <AppSelect
              options={studentFilterOptions}
              value={studentFilter}
              onChange={(v) => handleStudentChange(v ?? "all")}
              placeholder="Pilih Siswa"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
            <span className="whitespace-nowrap">Tahun Ajaran</span>
            <AppSelect
              options={yearFilterOptions}
              value={yearFilter}
              onChange={(v) => handleYearChange(v ?? "all")}
              placeholder="Pilih Tahun Ajaran"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
            <span className="whitespace-nowrap">Status</span>
            <AppSelect
              options={statusFilterOptions}
              value={statusFilter}
              onChange={(v) => handleStatusChange(v ?? "all")}
              placeholder="Pilih Status"
              isSearchable={false}
            />
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data siswa kelas.</p>
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
                  Tidak ada siswa dalam kelas.
                </div>
              ) : (
                data.map((row) => {
                  const meta =
                    STATUS_META[row.status] ?? { label: row.status, variant: "secondary" as const };
                  return (
                    <div
                      key={row.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-on-surface">
                            {row.student?.name ?? `#${row.student_id}`}
                          </p>
                          <p className="mt-0.5 text-xs text-on-surface-variant">
                            {row.class?.name ?? `#${row.class_id}`}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {row.academic_year?.name ?? `#${row.academic_year_id}`}
                          </p>
                        </div>
                        <Badge
                          variant={meta.variant}
                          className="shrink-0 px-2.5 py-1 text-xs leading-4"
                        >
                          {meta.label}
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
                  );
                })
              )}
            </div>

            <div className="hidden sm:block">
              <DataTable
                columns={columns}
                data={data}
                loading={loading}
                emptyMessage="Tidak ada siswa dalam kelas."
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

      <ClassStudentForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <ClassStudentDeleteDialog
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
