import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import AppSelect from "@/components/ui/Select";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { classSubjectService } from "../api/class-subject.service";
import { classService } from "../api/class.service";
import { subjectService } from "../api/subject.service";
import { teacherService } from "@/features/teachers-staff/api/teacher.service";
import { formatTeacherName, type Teacher } from "@/features/teachers-staff/api/types";
import type { ClassSubject, SchoolClass, Subject } from "../api/types";
import ClassSubjectForm from "../components/class-subject/ClassSubjectForm";
import ClassSubjectDeleteDialog from "../components/class-subject/ClassSubjectDeleteDialog";

const PER_PAGE = 10;

interface QueryState {
  class_id: number | undefined;
  subject_id: number | undefined;
  teacher_id: number | undefined;
  page: number;
}

export default function ClassSubjectsPage() {
  const [data, setData] = useState<ClassSubject[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [classFilter, setClassFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const [query, setQuery] = useState<QueryState>({
    class_id: undefined,
    subject_id: undefined,
    teacher_id: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClassSubject | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ClassSubject | null>(null);

  useEffect(() => {
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
    teacherService
      .list({ per_page: 100 })
      .then((res) => setTeachers(res.data))
      .catch(() => {
        toast.error("Gagal memuat data guru");
      });
  }, []);

  useEffect(() => {
    let active = true;

    classSubjectService
      .list({
        class_id: query.class_id,
        subject_id: query.subject_id,
        teacher_id: query.teacher_id,
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
        toast.error("Gagal memuat data mata pelajaran kelas", {
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

  const openEdit = useCallback((row: ClassSubject) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: ClassSubject) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = ClassSubject;
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
        header: "Mata Pelajaran",
        accessor: "subject" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">
            {row.subject?.name ?? `#${row.subject_id}`}
          </span>
        ),
      },
      {
        header: "Guru",
        accessor: "teacher" as keyof Row,
        className: "px-6 py-4 text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">
            {row.teacher
              ? row.teacher.full_name ?? `#${row.teacher_id}`
              : row.teacher_id != null
                ? `#${row.teacher_id}`
                : "-"}
          </span>
        ),
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
              aria-label={`Edit ${row.class?.name ?? row.class_id} - ${row.subject?.name ?? row.subject_id}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label={`Hapus ${row.class?.name ?? row.class_id} - ${row.subject?.name ?? row.subject_id}`}
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
  const subjectFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Mata Pelajaran" },
      ...subjects.map((s) => ({ value: String(s.id), label: s.name })),
    ],
    [subjects],
  );
  const teacherFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Guru" },
      ...teachers.map((t) => ({ value: String(t.id), label: formatTeacherName(t) })),
    ],
    [teachers],
  );

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Mapel Kelas"
        description="Kelola penugasan mata pelajaran pada setiap kelas."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center *:md:gap-3">
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
            <span className="whitespace-nowrap">Guru</span>
              <AppSelect
                options={teacherFilterOptions}
                value={teacherFilter}
                onChange={(v) => handleTeacherChange(v ?? "all")}
                placeholder="Pilih Guru"
              />
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data mata pelajaran kelas.</p>
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
            {/* Kartu untuk mobile */}
            <div className="space-y-3 sm:hidden">
              {loading ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Memuat data...
                </div>
              ) : data.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Tidak ada data mata pelajaran kelas.
                </div>
              ) : (
                data.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-on-surface">
                          {row.class?.name ?? `#${row.class_id}`}
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {row.subject?.name ?? `#${row.subject_id}`}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {row.teacher
                            ? row.teacher.full_name ?? `#${row.teacher_id}`
                            : row.teacher_id != null
                              ? `#${row.teacher_id}`
                              : "-"}
                        </p>
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
                ))
              )}
            </div>

            <div className="hidden sm:block">
              <DataTable
                columns={columns}
                data={data}
                loading={loading}
                emptyMessage="Tidak ada data mata pelajaran kelas."
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

      <ClassSubjectForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <ClassSubjectDeleteDialog
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
