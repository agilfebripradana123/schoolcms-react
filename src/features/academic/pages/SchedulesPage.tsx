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
import { scheduleService } from "../api/schedule.service";
import { classService } from "../api/class.service";
import { teacherService } from "@/features/teachers-staff/api/teacher.service";
import { formatTeacherName, type Teacher } from "@/features/teachers-staff/api/types";
import type { SchoolClass, Schedule, ScheduleDay } from "../api/types";
import ScheduleForm from "../components/schedule/ScheduleForm";
import ScheduleDeleteDialog from "../components/schedule/ScheduleDeleteDialog";

const PER_PAGE = 10;

const DAY_OPTIONS: Array<{ value: ScheduleDay; label: string }> = [
  { value: "senin", label: "Senin" },
  { value: "selasa", label: "Selasa" },
  { value: "rabu", label: "Rabu" },
  { value: "kamis", label: "Kamis" },
  { value: "jumat", label: "Jumat" },
  { value: "sabtu", label: "Sabtu" },
];

const DAY_LABELS: Record<ScheduleDay, string> = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
};

interface QueryState {
  class_id: number | undefined;
  day: ScheduleDay | undefined;
  teacher_id: number | undefined;
  page: number;
}

export default function SchedulesPage() {
  const [data, setData] = useState<Schedule[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [classFilter, setClassFilter] = useState<string>("all");
  const [dayFilter, setDayFilter] = useState<string>("all");
  const [teacherFilter, setTeacherFilter] = useState<string>("all");

  const [query, setQuery] = useState<QueryState>({
    class_id: undefined,
    day: undefined,
    teacher_id: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Schedule | null>(null);

  useEffect(() => {
    classService
      .list()
      .then((res) => setClasses(res.data))
      .catch(() => {
        toast.error("Gagal memuat data kelas");
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
    setLoading(true);
    setError(null);

    scheduleService
      .list({
        class_id: query.class_id,
        day: query.day,
        teacher_id: query.teacher_id,
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
        toast.error("Gagal memuat data jadwal", {
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

  const handleDayChange = useCallback((value: string) => {
    setDayFilter(value);
    setQuery((prev) => ({
      ...prev,
      day: value === "all" ? undefined : (value as ScheduleDay),
      page: 1,
    }));
  }, []);

  const handleTeacherChange = useCallback((value: string) => {
    setTeacherFilter(value);
    setQuery((prev) => ({
      ...prev,
      teacher_id: value === "all" ? undefined : Number(value),
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

  const openEdit = useCallback((row: Schedule) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Schedule) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const classMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const c of classes) map[c.id] = c.name;
    return map;
  }, [classes]);

  const teacherMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const t of teachers) map[t.id] = formatTeacherName(t);
    return map;
  }, [teachers]);

  const className = useCallback(
    (row: Schedule) =>
      row.class?.name ??
      (row.class_id != null ? classMap[row.class_id] ?? `#${row.class_id}` : "-"),
    [classMap],
  );
  const teacherName = useCallback(
    (row: Schedule) =>
      row.teacher?.full_name ??
      (row.teacher_id != null
        ? teacherMap[row.teacher_id] ?? `#${row.teacher_id}`
        : "-"),
    [teacherMap],
  );
  const subjectName = useCallback((row: Schedule) => row.subject?.name ?? `#${row.subject_id}`, []);
  const periodTime = useCallback(
    (row: Schedule) => {
      const start = row.period?.start_time;
      const end = row.period?.end_time;
      return start ? `${start} - ${end ?? ""}` : "-";
    },
    [],
  );

  const columns = useMemo(() => {
    type Row = Schedule;
    return [
      {
        header: "Hari",
        accessor: "day" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="font-medium text-on-surface">{DAY_LABELS[row.day] ?? row.day ?? "-"}</span>
        ),
      },
      {
        header: "Jam",
        accessor: "period" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{periodTime(row)}</span>
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
        header: "Mata Pelajaran",
        accessor: "subject_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{subjectName(row)}</span>
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
              aria-label="Edit jadwal"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus jadwal"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [className, subjectName, teacherName, periodTime, openEdit, openDelete]);

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
  const dayFilterOptions = useMemo(
    () => [{ value: "all", label: "Semua Hari" }, ...DAY_OPTIONS],
    [],
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
        title="Jadwal"
        description="Kelola jadwal pelajaran pada setiap kelas."
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
            <span className="whitespace-nowrap">Hari</span>
            <AppSelect
              options={dayFilterOptions}
              value={dayFilter}
              onChange={(v) => handleDayChange(v ?? "all")}
              placeholder="Pilih Hari"
              isSearchable={false}
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
            <p className="text-sm text-error">Gagal memuat data jadwal.</p>
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
                  Tidak ada jadwal.
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
                          {DAY_LABELS[row.day] ?? row.day ?? "-"}
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {periodTime(row)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {className(row)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {subjectName(row)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Guru: {teacherName(row)}
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
                emptyMessage="Tidak ada jadwal."
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

      <ScheduleForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <ScheduleDeleteDialog
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