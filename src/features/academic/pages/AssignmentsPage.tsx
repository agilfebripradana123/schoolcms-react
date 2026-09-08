import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import AppSelect from "@/components/ui/Select";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Pagination from "@/components/ui/Pagination";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { assignmentService } from "../api/assignment.service";
import { classService } from "../api/class.service";
import { subjectService } from "../api/subject.service";
import { teacherService } from "@/features/teachers-staff/api/teacher.service";
import { formatTeacherName, type Teacher } from "@/features/teachers-staff/api/types";
import type { Assignment, SchoolClass, Subject } from "../api/types";
import AssignmentForm from "../components/assignment/AssignmentForm";
import AssignmentDeleteDialog from "../components/assignment/AssignmentDeleteDialog";

const PER_PAGE = 10;

interface QueryState {
  q: string;
  class_id: number | undefined;
  subject_id: number | undefined;
  page: number;
}

function formatDate(value?: string): string {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value.substring(0, 10)
    : d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function AssignmentsPage() {
  const [data, setData] = useState<Assignment[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  const [query, setQuery] = useState<QueryState>({
    q: "",
    class_id: undefined,
    subject_id: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Assignment | null>(null);

  const searchTimeout = useRef<number | null>(null);

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

    assignmentService
      .list({
        q: query.q || undefined,
        class_id: query.class_id,
        subject_id: query.subject_id,
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
        toast.error("Gagal memuat data tugas", {
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

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    searchTimeout.current = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      setQuery((prev) => ({ ...prev, q: value, page: 1 }));
    }, 400);
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

  const openEdit = useCallback((row: Assignment) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Assignment) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const classMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const c of classes) map[c.id] = c.name;
    return map;
  }, [classes]);

  const subjectMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const s of subjects) map[s.id] = s.name;
    return map;
  }, [subjects]);

  const teacherMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const t of teachers) map[t.id] = formatTeacherName(t);
    return map;
  }, [teachers]);

  const className = useCallback(
    (row: Assignment) =>
      row.class?.name ??
      (row.class_id != null ? classMap[row.class_id] ?? `#${row.class_id}` : "-"),
    [classMap],
  );
  const subjectName = useCallback(
    (row: Assignment) =>
      row.subject?.name ?? (row.subject_id != null ? subjectMap[row.subject_id] ?? `#${row.subject_id}` : "-"),
    [subjectMap],
  );
  const teacherName = useCallback(
    (row: Assignment) =>
      row.teacher?.full_name ??
      (row.teacher_id != null
        ? teacherMap[row.teacher_id] ?? `#${row.teacher_id}`
        : "-"),
    [teacherMap],
  );

  const columns = useMemo(() => {
    type Row = Assignment;
    return [
      {
        header: "Judul",
        accessor: "title" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="font-medium text-on-surface">{row.title}</span>
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
        header: "Guru",
        accessor: "teacher_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{teacherName(row)}</span>
        ),
      },
      {
        header: "Tenggat",
        accessor: "due_date" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{formatDate(row.due_date)}</span>
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
              aria-label={`Edit ${row.title}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label={`Hapus ${row.title}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [className, subjectName, teacherName, openEdit, openDelete]);


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

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Tugas"
        description="Kelola tugas yang diberikan kepada siswa."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end *:md:gap-3">
          <div className="md:min-w-[220px] md:flex-1">
            <Search
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari judul tugas..."
            />
          </div>
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:min-w-[160px] md:flex-1">
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
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data tugas.</p>
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
                  Tidak ada tugas.
                </div>
              ) : (
                data.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-on-surface">{row.title}</p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {subjectName(row)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {className(row)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Guru: {teacherName(row)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Tenggat: {formatDate(row.due_date)}
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
                emptyMessage="Tidak ada tugas."
              />
            </div>
          </>
        )}

        <Pagination meta={meta} onPageChange={goToPage} loading={loading} error={error} />
      </Card>

      <AssignmentForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <AssignmentDeleteDialog
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