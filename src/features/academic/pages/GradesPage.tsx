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
import { gradeService } from "../api/grade.service";
import { classService } from "../api/class.service";
import { subjectService } from "../api/subject.service";
import { studentService } from "@/features/students/api/student.service";
import type { Student } from "@/features/students/api/types";
import type { Grade, GradeType, SchoolClass, Subject } from "../api/types";
import GradeForm from "../components/grade/GradeForm";
import GradeDeleteDialog from "../components/grade/GradeDeleteDialog";

const PER_PAGE = 10;

const GRADE_TYPE_LABELS: Record<GradeType, string> = {
  tugas: "Tugas",
  uts: "UTS",
  uas: "UAS",
};

const TYPE_OPTIONS: Array<{ value: GradeType; label: string }> = [
  { value: "tugas", label: "Tugas" },
  { value: "uts", label: "UTS" },
  { value: "uas", label: "UAS" },
];

type TypeFilter = "all" | GradeType;

interface QueryState {
  student_id: number | undefined;
  subject_id: number | undefined;
  class_id: number | undefined;
  type: GradeType | undefined;
  page: number;
}

export default function GradesPage() {
  const [data, setData] = useState<Grade[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const [query, setQuery] = useState<QueryState>({
    student_id: undefined,
    subject_id: undefined,
    class_id: undefined,
    type: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Grade | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Grade | null>(null);

  useEffect(() => {
    studentService
      .list({ per_page: 200 })
      .then((res) => setStudents(res.data))
      .catch(() => {
        toast.error("Gagal memuat data siswa");
      });
    subjectService
      .list()
      .then((res) => setSubjects(res.data))
      .catch(() => {
        toast.error("Gagal memuat data mata pelajaran");
      });
    classService
      .list()
      .then((res) => setClasses(res.data))
      .catch(() => {
        toast.error("Gagal memuat data kelas");
      });
  }, []);

  useEffect(() => {
    let active = true;

    gradeService
      .list({
        student_id: query.student_id,
        subject_id: query.subject_id,
        class_id: query.class_id,
        type: query.type,
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
        toast.error("Gagal memuat data nilai", {
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

  const handleStudentChange = useCallback((value: string) => {
    setLoading(true);
    setError(null);
    setStudentFilter(value);
    setQuery((prev) => ({
      ...prev,
      student_id: value === "all" ? undefined : Number(value),
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

  const handleTypeChange = useCallback((value: TypeFilter) => {
    setLoading(true);
    setError(null);
    setTypeFilter(value);
    setQuery((prev) => ({
      ...prev,
      type: value === "all" ? undefined : value,
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
    setQuery((prev) => ({ ...prev }));
  }, []);

  const handleDeleted = useCallback(() => {
    setLoading(true);
    setError(null);
    setDeleteOpen(false);
    setToDelete(null);
    setQuery((prev) => ({ ...prev }));
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: Grade) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Grade) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const studentMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const s of students) map[s.id] = s.name;
    return map;
  }, [students]);

  const subjectMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const s of subjects) map[s.id] = s.name;
    return map;
  }, [subjects]);

  const classMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const c of classes) map[c.id] = c.name;
    return map;
  }, [classes]);

  const studentName = useCallback(
    (row: Grade) =>
      row.student?.name ??
      (row.student_id != null ? studentMap[row.student_id] ?? `#${row.student_id}` : "-"),
    [studentMap],
  );
  const subjectName = useCallback(
    (row: Grade) =>
      row.subject?.name ??
      (row.subject_id != null ? subjectMap[row.subject_id] ?? `#${row.subject_id}` : "-"),
    [subjectMap],
  );
  const className = useCallback(
    (row: Grade) =>
      row.class?.name ??
      (row.class_id != null ? classMap[row.class_id] ?? `#${row.class_id}` : "-"),
    [classMap],
  );

  const columns = useMemo(() => {
    type Row = Grade;
    return [
      {
        header: "Siswa",
        accessor: "student_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="font-medium text-on-surface">{studentName(row)}</span>
        ),
      },
      {
        header: "Mata Pelajaran",
        accessor: "subject_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{subjectName(row)}</span>
        ),
      },
      {
        header: "Kelas",
        accessor: "class_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{className(row)}</span>
        ),
      },
      {
        header: "Jenis",
        accessor: "type" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <Badge variant={row.type === "uas" ? "warning" : row.type === "uts" ? "primary" : "secondary"}>
            {GRADE_TYPE_LABELS[row.type] ?? row.type ?? "-"}
          </Badge>
        ),
      },
      {
        header: "Nilai",
        accessor: "score" as keyof Row,
        headerClassName: "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="font-semibold text-on-surface">{row.score ?? "-"}</span>
        ),
      },
      {
        header: "Semester",
        accessor: "semester" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{row.semester ? `Semester ${row.semester}` : "-"}</span>
        ),
      },
      {
        header: "Tahun Ajaran",
        accessor: "academic_year" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{row.academic_year || "-"}</span>
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
              aria-label="Edit nilai"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus nilai"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [studentName, subjectName, className, openEdit, openDelete]);

  const isFirstPage = meta.current_page <= 1;
  const isLastPage = meta.current_page >= meta.last_page;
  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  const studentFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Siswa" },
      ...students.map((s) => ({ value: String(s.id), label: s.name })),
    ],
    [students],
  );
  const subjectFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Mata Pelajaran" },
      ...subjects.map((s) => ({ value: String(s.id), label: s.name })),
    ],
    [subjects],
  );
  const classFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Kelas" },
      ...classes.map((c) => ({ value: String(c.id), label: c.name })),
    ],
    [classes],
  );
  const typeFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Jenis" },
      ...TYPE_OPTIONS.map((t) => ({ value: t.value, label: t.label })),
    ],
    [],
  );

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Nilai"
        description="Kelola nilai siswa pada setiap mata pelajaran."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 *:md:gap-3">
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
            <span className="whitespace-nowrap">Mata Pelajaran</span>
            <AppSelect
              options={subjectFilterOptions}
              value={subjectFilter}
              onChange={(v) => handleSubjectChange(v ?? "all")}
              placeholder="Pilih Mata Pelajaran"
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
            <span className="whitespace-nowrap">Jenis</span>
            <AppSelect
              options={typeFilterOptions}
              value={typeFilter}
              onChange={(v) => handleTypeChange((v ?? "all") as TypeFilter)}
              placeholder="Pilih Jenis"
              isSearchable={false}
            />
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data nilai.</p>
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
                  Tidak ada nilai.
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
                          {studentName(row)}
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {subjectName(row)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {className(row)}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-xs text-on-surface-variant">
                          <Badge variant={row.type === "uas" ? "warning" : row.type === "uts" ? "primary" : "secondary"}>
                            {GRADE_TYPE_LABELS[row.type] ?? row.type ?? "-"}
                          </Badge>
                          <span className="font-semibold text-on-surface">{row.score ?? "-"}</span>
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {row.semester ? `Semester ${row.semester}` : "-"} ·{" "}
                          {row.academic_year || "-"}
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
                emptyMessage="Tidak ada nilai."
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

      <GradeForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <GradeDeleteDialog
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