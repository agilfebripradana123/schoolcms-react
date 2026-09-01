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
import { reportCardService } from "../api/report-card.service";
import { classService } from "../api/class.service";
import { semesterService } from "../api/semester.service";
import { studentService } from "@/features/students/api/student.service";
import type { ReportCard, ReportCardStatus, SchoolClass, Semester } from "../api/types";
import type { Student } from "@/features/students/api/types";
import ReportCardForm from "../components/report-card/ReportCardForm";
import ReportCardDeleteDialog from "../components/report-card/ReportCardDeleteDialog";

const PER_PAGE = 10;

const STATUS_LABELS: Record<ReportCardStatus, string> = {
  draft: "Draft",
  published: "Terbit",
};

const STATUS_OPTIONS: Array<{ value: ReportCardStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Terbit" },
];

type StatusFilter = "all" | ReportCardStatus;

interface QueryState {
  student_id: number | undefined;
  class_id: number | undefined;
  semester_id: number | undefined;
  status: ReportCardStatus | undefined;
  page: number;
}

export default function ReportCardsPage() {
  const [data, setData] = useState<ReportCard[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [query, setQuery] = useState<QueryState>({
    student_id: undefined,
    class_id: undefined,
    semester_id: undefined,
    status: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ReportCard | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ReportCard | null>(null);

  useEffect(() => {
    studentService
      .list({ per_page: 200 })
      .then((res) => setStudents(res.data))
      .catch(() => {
        toast.error("Gagal memuat data siswa");
      });
    classService
      .list()
      .then((res) => setClasses(res.data))
      .catch(() => {
        toast.error("Gagal memuat data kelas");
      });
    semesterService
      .list({ per_page: 100 })
      .then((res) => setSemesters(res.data))
      .catch(() => {
        toast.error("Gagal memuat data semester");
      });
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    reportCardService
      .list({
        student_id: query.student_id,
        class_id: query.class_id,
        semester_id: query.semester_id,
        status: query.status,
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
        toast.error("Gagal memuat data rapor", {
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
    setStudentFilter(value);
    setQuery((prev) => ({
      ...prev,
      student_id: value === "all" ? undefined : Number(value),
      page: 1,
    }));
  }, []);

  const handleClassChange = useCallback((value: string) => {
    setClassFilter(value);
    setQuery((prev) => ({
      ...prev,
      class_id: value === "all" ? undefined : Number(value),
      page: 1,
    }));
  }, []);

  const handleSemesterChange = useCallback((value: string) => {
    setSemesterFilter(value);
    setQuery((prev) => ({
      ...prev,
      semester_id: value === "all" ? undefined : Number(value),
      page: 1,
    }));
  }, []);

  const handleStatusChange = useCallback((value: StatusFilter) => {
    setStatusFilter(value);
    setQuery((prev) => ({
      ...prev,
      status: value === "all" ? undefined : value,
      page: 1,
    }));
  }, []);

  const goToPage = useCallback((target: number) => {
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const handleSaved = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
    setQuery((prev) => ({ ...prev }));
  }, []);

  const handleDeleted = useCallback(() => {
    setDeleteOpen(false);
    setToDelete(null);
    setQuery((prev) => ({ ...prev }));
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: ReportCard) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: ReportCard) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const studentMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const s of students) map[s.id] = s.name;
    return map;
  }, [students]);

  const classMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const c of classes) map[c.id] = c.name;
    return map;
  }, [classes]);

  const semesterMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const s of semesters) map[s.id] = `Semester ${s.name}`;
    return map;
  }, [semesters]);

  const studentName = useCallback(
    (row: ReportCard) =>
      row.student?.name ??
      (row.student_id != null ? studentMap[row.student_id] ?? `#${row.student_id}` : "-"),
    [studentMap],
  );
  const className = useCallback(
    (row: ReportCard) =>
      row.class?.name ??
      (row.class_id != null ? classMap[row.class_id] ?? `#${row.class_id}` : "-"),
    [classMap],
  );
  const semesterName = useCallback(
    (row: ReportCard) =>
      row.semester
        ? `Semester ${row.semester.name}`
        : row.semester_id != null
          ? semesterMap[row.semester_id] ?? `#${row.semester_id}`
          : "-",
    [semesterMap],
  );

  const columns = useMemo(() => {
    type Row = ReportCard;
    return [
      {
        header: "Siswa",
        accessor: "student_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="font-medium text-on-surface">{studentName(row)}</span>
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
        header: "Tahun Ajaran",
        accessor: "academic_year_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{row.academic_year?.name ?? `#${row.academic_year_id}`}</span>
        ),
      },
      {
        header: "Semester",
        accessor: "semester_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{semesterName(row)}</span>
        ),
      },
      {
        header: "Status",
        accessor: "status" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <Badge variant={row.status === "published" ? "success" : "neutral"}>
            {STATUS_LABELS[row.status] ?? row.status ?? "-"}
          </Badge>
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
              aria-label="Edit rapor"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus rapor"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [studentName, className, semesterName, openEdit, openDelete]);

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
  const classFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Kelas" },
      ...classes.map((c) => ({ value: String(c.id), label: c.name })),
    ],
    [classes],
  );
  const semesterFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Semester" },
      ...semesters.map((s) => ({ value: String(s.id), label: `Semester ${s.name}` })),
    ],
    [semesters],
  );
  const statusFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Status" },
      ...STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
    ],
    [],
  );

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Rapor"
        description="Kelola rapor siswa pada setiap semester."
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
            <span className="whitespace-nowrap">Kelas</span>
            <AppSelect
              options={classFilterOptions}
              value={classFilter}
              onChange={(v) => handleClassChange(v ?? "all")}
              placeholder="Pilih Kelas"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
            <span className="whitespace-nowrap">Semester</span>
            <AppSelect
              options={semesterFilterOptions}
              value={semesterFilter}
              onChange={(v) => handleSemesterChange(v ?? "all")}
              placeholder="Pilih Semester"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
            <span className="whitespace-nowrap">Status</span>
            <AppSelect
              options={statusFilterOptions}
              value={statusFilter}
              onChange={(v) => handleStatusChange((v ?? "all") as StatusFilter)}
              placeholder="Pilih Status"
              isSearchable={false}
            />
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data rapor.</p>
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
                  Tidak ada rapor.
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
                          {className(row)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {row.academic_year?.name ?? `#${row.academic_year_id}`} ·{" "}
                          {semesterName(row)}
                        </p>
                      </div>
                      <Badge
                        variant={row.status === "published" ? "success" : "neutral"}
                        className="shrink-0 px-2.5 py-1 text-xs leading-4"
                      >
                        {STATUS_LABELS[row.status] ?? row.status ?? "-"}
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
                ))
              )}
            </div>

            <div className="hidden sm:block">
              <DataTable
                columns={columns}
                data={data}
                loading={loading}
                emptyMessage="Tidak ada rapor."
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

      <ReportCardForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <ReportCardDeleteDialog
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