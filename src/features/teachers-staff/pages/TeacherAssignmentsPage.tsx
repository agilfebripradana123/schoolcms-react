import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import AppSelect from "@/components/ui/Select";
import PageContainer from "@/components/layout/PageContainer";
import Pagination from "../../../components/ui/Pagination";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { teacherAssignmentService } from "../../academic/api/teacher-assignment.service";
import { classService } from "../../academic/api/class.service";
import { subjectService } from "../../academic/api/subject.service";
import { academicYearService } from "../../academic/api/academic-year.service";
import { teacherService } from "@/features/teachers-staff/api/teacher.service";
import { formatTeacherName, type Teacher } from "@/features/teachers-staff/api/types";
import type {
  AcademicYear,
  SchoolClass,
  Subject,
  TeacherAssignment,
} from "../../academic/api/types";
import TeacherAssignmentForm from "../../academic/components/teacher-assignment/TeacherAssignmentForm";
import TeacherAssignmentDeleteDialog from "../../academic/components/teacher-assignment/TeacherAssignmentDeleteDialog";

const PER_PAGE = 10;

interface QueryState {
  teacher_id: number | undefined;
  class_id: number | undefined;
  subject_id: number | undefined;
  academic_year_id: number | undefined;
  page: number;
}

export default function TeacherAssignmentsPage() {
  const [data, setData] = useState<TeacherAssignment[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);

  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const [query, setQuery] = useState<QueryState>({
    teacher_id: undefined,
    class_id: undefined,
    subject_id: undefined,
    academic_year_id: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TeacherAssignment | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<TeacherAssignment | null>(null);

  useEffect(() => {
    teacherService
      .list({ per_page: 100 })
      .then((res) => setTeachers(res.data))
      .catch(() => {
        toast.error("Gagal memuat data guru");
      });
    classService
      .list()
      .then((res) => setClasses(res.data))
      .catch(() => {
        toast.error("Gagal memuat data kelas");
      });
    subjectService
      .list()
      .then((res) => setSubjects(res.data))
      .catch(() => {
        toast.error("Gagal memuat data mata pelajaran");
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

    teacherAssignmentService
      .list({
        teacher_id: query.teacher_id,
        class_id: query.class_id,
        subject_id: query.subject_id,
        academic_year_id: query.academic_year_id,
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
        toast.error("Gagal memuat data penugasan guru", {
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

  const handleTeacherChange = useCallback((value: string) => {
    setLoading(true);
    setError(null);
    setTeacherFilter(value);
    setQuery((prev) => ({
      ...prev,
      teacher_id: value === "all" ? undefined : Number(value),
      page: 1,
    }));
  }, []);

  const handleClassChange = useCallback((value: string) => {
    setLoading(true);
    setError(null);
    setClassFilter(value);
    setQuery((prev) => ({
      ...prev,
      class_id: value === "all" ? undefined : Number(value),
      page: 1,
    }));
  }, []);

  const handleSubjectChange = useCallback((value: string) => {
    setLoading(true);
    setError(null);
    setSubjectFilter(value);
    setQuery((prev) => ({
      ...prev,
      subject_id: value === "all" ? undefined : Number(value),
      page: 1,
    }));
  }, []);

  const handleYearChange = useCallback((value: string) => {
    setLoading(true);
    setError(null);
    setYearFilter(value);
    setQuery((prev) => ({
      ...prev,
      academic_year_id: value === "all" ? undefined : Number(value),
      page: 1,
    }));
  }, []);

  const goToPage = useCallback((target: number) => {
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const handleSaved = useCallback(() => {
    setLoading(true);
    setError(null);
    setFormOpen(false);
    setEditing(null);
    setQuery((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleDeleted = useCallback(() => {
    setLoading(true);
    setError(null);
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

  const openEdit = useCallback((row: TeacherAssignment) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: TeacherAssignment) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const teacherName = useCallback(
    (row: TeacherAssignment) =>
      row.teacher ? row.teacher.full_name ?? `#${row.teacher_id}` : `#${row.teacher_id}`,
    [],
  );

  const columns = useMemo(() => {
    type Row = TeacherAssignment;
    return [
      {
        header: "Guru",
        accessor: "teacher" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="font-medium text-on-surface">{teacherName(row)}</span>
        ),
      },
      {
        header: "Kelas",
        accessor: "class" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-on-surface-variant">
            {row.class?.name ?? `#${row.class_id}`}
          </span>
        ),
      },
      {
        header: "Mata Pelajaran",
        accessor: "subject" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-on-surface-variant">
            {row.subject?.name ?? `#${row.subject_id}`}
          </span>
        ),
      },
      {
        header: "Tahun Ajaran",
        accessor: "academic_year" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-on-surface-variant">
            {row.academic_year?.name ?? `#${row.academic_year_id}`}
          </span>
        ),
      },
      {
        header: "Aksi",
        accessor: "id" as keyof Row,
        headerClassName: "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label={`Edit penugasan ${teacherName(row)}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label={`Hapus penugasan ${teacherName(row)}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        ),
      },
    ];
  }, [openEdit, openDelete, teacherName]);

  const teacherFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Guru" },
      ...teachers.map((t) => ({ value: String(t.id), label: formatTeacherName(t) })),
    ],
    [teachers],
  );
  const classFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Kelas" },
      ...classes.map((c) => ({ value: String(c.id), label: c.name })),
    ],
    [classes],
  );
  const subjectFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Mata Pelajaran" },
      ...subjects.map((s) => ({ value: String(s.id), label: s.name })),
    ],
    [subjects],
  );
  const yearFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Tahun Ajaran" },
      ...years.map((y) => ({ value: String(y.id), label: y.name })),
    ],
    [years],
  );

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Penugasan Guru"
        description="Kelola penugasan guru berdasarkan kelas, mata pelajaran, dan tahun ajaran."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 *:md:gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
            <span className="whitespace-nowrap">Guru</span>
              <AppSelect
                options={teacherFilterOptions}
                value={teacherFilter}
                onChange={(v) => handleTeacherChange(v ?? "all")}
                placeholder="Pilih Guru"
              />
          </label>
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
            <span className="whitespace-nowrap">Mata Pelajaran</span>
            <AppSelect
              options={subjectFilterOptions}
              value={subjectFilter}
              onChange={(v) => handleSubjectChange(v ?? "all")}
              placeholder="Pilih Mata Pelajaran"
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
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data penugasan guru.</p>
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
                <div className="py-10 text-center text-sm text-slate-500">Memuat data...</div>
              ) : data.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Tidak ada penugasan guru.
                </div>
              ) : (
                data.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-on-surface">{teacherName(row)}</p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {row.subject?.name ?? `#${row.subject_id}`}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-on-surface-variant">
                      <p>
                        Kelas: {row.class?.name ?? `#${row.class_id}`}
                      </p>
                      <p>
                        Tahun Ajaran: {row.academic_year?.name ?? `#${row.academic_year_id}`}
                      </p>
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

            {/* Tabel untuk desktop */}
            <div className="hidden sm:block">
              <DataTable
                columns={columns}
                data={data}
                loading={loading}
                emptyMessage="Tidak ada penugasan guru."
              />
            </div>
          </>
        )}

        <Pagination meta={meta} onPageChange={goToPage} loading={loading} error={error} />
      </Card>

      <TeacherAssignmentForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <TeacherAssignmentDeleteDialog
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
