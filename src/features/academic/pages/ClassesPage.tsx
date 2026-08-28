import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { classService } from "../api/class.service";
import type { SchoolClass } from "../api/types";
import { teacherService } from "@/features/teachers-staff/api/teacher.service";
import { formatTeacherName, type Teacher } from "@/features/teachers-staff/api/types";
import ClassForm from "../components/class/ClassForm";
import ClassDeleteDialog from "../components/class/ClassDeleteDialog";

export default function ClassesPage() {
  const [data, setData] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolClass | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<SchoolClass | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);

    classService
      .list()
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        setError(toApiError(err));
        setData([]);
        toast.error("Gagal memuat data kelas", {
          description: toApiError(err).message,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData();
    teacherService
      .list({ per_page: 100 })
      .then((res) => setTeachers(res.data))
      .catch(() => {
        // opsional: wali kelas hanya menampilkan id jika gagal dimuat
      });
  }, [loadData]);

  const teacherNameById = useMemo(() => {
    const map: Record<number, string> = {};
    for (const t of teachers) {
      map[t.id] = formatTeacherName(t);
    }
    return map;
  }, [teachers]);

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

  const openEdit = useCallback((row: SchoolClass) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: SchoolClass) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = SchoolClass;
    return [
      {
        header: "Nama Kelas",
        accessor: "name" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="font-medium text-on-surface">{row.name}</span>
        ),
      },
      {
        header: "Tingkat",
        accessor: "level" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{row.level || "-"}</span>
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
        header: "Wali Kelas",
        accessor: "teacher_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">
            {row.teacher_id != null
              ? teacherNameById[row.teacher_id] ?? `#${row.teacher_id}`
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
              aria-label={`Edit ${row.name}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label={`Hapus ${row.name}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [openEdit, openDelete, teacherNameById]);

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Kelas"
        description="Kelola data kelas sekolah."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data kelas.</p>
            <Button variant="secondary" onClick={loadData}>
              Muat Ulang
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            emptyMessage="Tidak ada kelas."
          />
        )}
      </Card>

      <ClassForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <ClassDeleteDialog
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
