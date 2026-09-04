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
import { counselingService } from "../api/counseling.service";
import type { Counseling, CounselingStatus } from "../api/types";
import { studentService } from "@/features/students/api/student.service";
import type { Student } from "@/features/students/api/types";
import { teacherService } from "@/features/teachers-staff/api/teacher.service";
import { formatTeacherName, type Teacher } from "@/features/teachers-staff/api/types";
import CounselingForm from "../components/counseling/CounselingForm";
import CounselingDeleteDialog from "../components/counseling/CounselingDeleteDialog";
import Pagination from "../../../components/ui/Pagination";

const PER_PAGE = 10;

interface QueryState {
  student_id: number | undefined;
  counselor_id: number | undefined;
  status: CounselingStatus | undefined;
  page: number;
}

const STATUS_META: Record<CounselingStatus, { label: string; variant: "warning" | "success" | "danger" }> = {
  terjadwal: { label: "Terjadwal", variant: "warning" },
  selesai: { label: "Selesai", variant: "success" },
  dibatalkan: { label: "Dibatalkan", variant: "danger" },
};

export default function CounselingsPage() {
  const [data, setData] = useState<Counseling[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [counselors, setCounselors] = useState<Teacher[]>([]);

  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [counselorFilter, setCounselorFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const [query, setQuery] = useState<QueryState>({
    student_id: undefined,
    counselor_id: undefined,
    status: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Counseling | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Counseling | null>(null);

  useEffect(() => {
    studentService
      .list({ per_page: 100 })
      .then((res) => setStudents(res.data))
      .catch(() => {
        toast.error("Gagal memuat data siswa");
      });
    teacherService
      .list({ per_page: 100 })
      .then((res) => setCounselors(res.data))
      .catch(() => {
        toast.error("Gagal memuat data konselor");
      });
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    counselingService
      .list({
        student_id: query.student_id,
        counselor_id: query.counselor_id,
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
        toast.error("Gagal memuat data bimbingan", {
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

  const handleCounselorChange = useCallback((value: string) => {
    setCounselorFilter(value);
    setQuery((prev) => ({
      ...prev,
      counselor_id: value === "all" ? undefined : Number(value),
      page: 1,
    }));
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    setQuery((prev) => ({
      ...prev,
      status: value === "all" ? undefined : (value as CounselingStatus),
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

  const openEdit = useCallback((row: Counseling) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Counseling) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = Counseling;
    return [
      {
        header: "Siswa",
        accessor: "student" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="font-medium text-on-surface">
            {row.student?.name ?? `#${row.student_id}`}
          </span>
        ),
      },
      {
        header: "Konselor",
        accessor: "counselor" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">
            {row.counselor
              ? formatTeacherName(row.counselor)
              : `#${row.counselor_id}`}
          </span>
        ),
      },
      {
        header: "Tanggal",
        accessor: "counseling_date" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{row.counseling_date}</span>
        ),
      },
      {
        header: "Topik",
        accessor: "topic" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{row.topic}</span>
        ),
      },
      {
        header: "Status",
        accessor: "status" as keyof Row,
        headerClassName: "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => {
          const meta = STATUS_META[row.status] ?? { label: row.status, variant: "neutral" as const };
          return (
            <Badge variant={meta.variant} className="px-2.5 py-1 text-xs leading-4">
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


  const studentFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Siswa" },
      ...students.map((s) => ({ value: String(s.id), label: s.name })),
    ],
    [students],
  );
  const counselorFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Konselor" },
      ...counselors.map((t) => ({ value: String(t.id), label: formatTeacherName(t) })),
    ],
    [counselors],
  );
  const statusFilterOptions = [
    { value: "all", label: "Semua Status" },
    { value: "terjadwal", label: "Terjadwal" },
    { value: "selesai", label: "Selesai" },
    { value: "dibatalkan", label: "Dibatalkan" },
  ];

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Bimbingan & Konseling"
        description="Kelola data bimbingan dan konseling siswa."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3 *:md:gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant">
            <span className="whitespace-nowrap">Siswa</span>
            <AppSelect
              options={studentFilterOptions}
              value={studentFilter}
              onChange={(v) => handleStudentChange(v ?? "all")}
              placeholder="Pilih Siswa"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant">
            <span className="whitespace-nowrap">Konselor</span>
            <AppSelect
              options={counselorFilterOptions}
              value={counselorFilter}
              onChange={(v) => handleCounselorChange(v ?? "all")}
              placeholder="Pilih Konselor"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant">
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
            <p className="text-sm text-error">Gagal memuat data bimbingan.</p>
            <Button variant="secondary" onClick={() => setQuery((prev) => ({ ...prev }))}>
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
                  Tidak ada data bimbingan.
                </div>
              ) : (
                data.map((row) => {
                  const meta =
                    STATUS_META[row.status] ?? { label: row.status, variant: "neutral" as const };
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
                            Konselor:{" "}
                            {row.counselor
                              ? formatTeacherName(row.counselor)
                              : `#${row.counselor_id}`}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {row.counseling_date} — {row.topic}
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
                        <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
                          <Pencil className="h-4 w-4" /> Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => openDelete(row)}>
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
                emptyMessage="Tidak ada data bimbingan."
              />
            </div>
          </>
        )}

        <Pagination meta={meta} onPageChange={goToPage} loading={loading} error={error} />
      </Card>

      <CounselingForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <CounselingDeleteDialog
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