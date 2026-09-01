import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { violationService } from "../api/violation.service";
import type { Violation } from "@/features/studentship/api/types";
import { studentService } from "@/features/students/api/student.service";
import type { Student } from "@/features/students/api/types";
import { teacherService } from "@/features/teachers-staff/api/teacher.service";
import { formatTeacherName, type Teacher } from "@/features/teachers-staff/api/types";
import ViolationForm from "../components/violation/ViolationForm";
import ViolationDeleteDialog from "../components/violation/ViolationDeleteDialog";

const SEVERITY_BADGE: Record<string, { label: string; variant: "warning" | "danger" | "neutral" }> = {
  ringan: { label: "Ringan", variant: "warning" },
  sedang: { label: "Sedang", variant: "danger" },
  berat: { label: "Berat", variant: "danger" },
};

const CATEGORY_BADGE: Record<string, { label: string; variant: "secondary" | "success" | "warning" | "danger" | "primary" | "neutral" }> = {
  tataTertib: { label: "Tata Tertib", variant: "primary" },
  kehadiran: { label: "Kehadiran", variant: "secondary" },
  pakaian: { label: "Pakaian", variant: "success" },
  perilaku: { label: "Perilaku", variant: "warning" },
  akademik: { label: "Akademik", variant: "secondary" },
  lainnya: { label: "Lainnya", variant: "neutral" },
};

export default function ViolationsPage() {
  const [data, setData] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Violation | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Violation | null>(null);

  useEffect(() => {
    studentService
      .list({ per_page: 100 })
      .then((res) => setStudents(res.data))
      .catch(() => {
        toast.error("Gagal memuat data siswa");
      });
    teacherService
      .list({ per_page: 100 })
      .then((res) => setTeachers(res.data))
      .catch(() => {
        toast.error("Gagal memuat data guru");
      });
  }, []);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);

    violationService
      .list()
      .then((res: { data: Violation[] }) => {
        setData(res.data);
      })
      .catch((err: unknown) => {
        const apiError = toApiError(err);
        setError(apiError);
        setData([]);
        toast.error("Gagal memuat data pelanggaran", {
          description: apiError.message,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaved = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
    loadData();
  }, [loadData]);

  const handleDeleted = useCallback(() => {
    setDeleteOpen(false);
    setToDelete(null);
    loadData();
  }, [loadData]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: Violation) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Violation) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const studentName = (id: number) => {
    const s = students.find((st) => st.id === id);
    return s?.name ?? `#${id}`;
  };

  const teacherName = (id: number | string | null | undefined) => {
    if (!id) return "-";
    const t = teachers.find((tc) => tc.id === Number(id));
    return t ? formatTeacherName(t) : `#${id}`;
  };

  const columns = useMemo(() => {
    type Row = Violation;
    return [
      {
        header: "Siswa",
        accessor: "student_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="font-medium text-on-surface">{studentName(row.student_id ?? 0)}</span>
        ),
      },
      {
        header: "Kategori",
        accessor: "category" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => {
          const cat = (row.category ?? "") as keyof typeof CATEGORY_BADGE;
          const meta = CATEGORY_BADGE[cat] ?? { label: row.category ?? "-", variant: "secondary" };
          return (
            <Badge variant={meta.variant} className="px-2.5 py-1 text-xs leading-4">
              {meta.label}
            </Badge>
          );
        },
      },
      {
        header: "Deskripsi",
        accessor: "description" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{row.description || "-"}</span>
        ),
      },
      {
        header: "Pointe",
        accessor: "points" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{row.points ?? "-"}</span>
        ),
      },
      {
        header: "Tanggal",
        accessor: "violated_at" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{row.violated_at || "-"}</span>
        ),
      },
      {
        header: "Ditangani Oleh",
        accessor: "handled_by" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{teacherName(row.handled_by)}</span>
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
              aria-label={`Edit pelanggaran ${row.category ?? row.id}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label={`Hapus pelanggaran ${row.category ?? row.id}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [openEdit, openDelete, students, teachers]);

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Pelanggaran"
        description="Kelola data pelanggaran siswa."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data pelanggaran.</p>
            <Button variant="secondary" onClick={loadData}>
              Muat Ulang
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:hidden">
              {loading ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Memuat data...
                </div>
              ) : data.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Tidak ada pelanggaran.
                </div>
              ) : (
                data.map((row) => (
                  <div key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-on-surface">{row.category || "-"}</p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          Siswa: {studentName(row.student_id ?? 0)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Pointe: {row.points} | {row.violated_at || "-"}
                        </p>
                      </div>
                      <Badge
                        variant={SEVERITY_BADGE[row.category as keyof typeof SEVERITY_BADGE]?.variant ?? "secondary"}
                        className="shrink-0 px-2.5 py-1 text-xs leading-4"
                      >
                        {CATEGORY_BADGE[row.category as keyof typeof CATEGORY_BADGE]?.label ?? row.category}
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
                ))
              )}
            </div>

            <div className="hidden sm:block">
              <DataTable columns={columns} data={data} loading={loading} emptyMessage="Tidak ada pelanggaran." />
            </div>
          </>
        )}
      </Card>

      <ViolationForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <ViolationDeleteDialog
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