import { useEffect, useMemo, useState } from "react";
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
import { achievementService } from "@/features/development/api/achievement.service";
import type { Achievement } from "@/features/development/api/types";
import { studentService } from "@/features/students/api/student.service";
import type { Student } from "@/features/students/api/types";
import AchievementForm from "../components/achievement/AchievementForm";
import AchievementDeleteDialog from "../components/achievement/AchievementDeleteDialog";

type AchievementLevel = "Sekolah" | "Kabupaten" | "Provinsi" | "Nasional" | "Internasional";

const LEVEL_BADGE: Record<AchievementLevel, { label: string; variant: "secondary" | "success" | "warning" | "danger" | "primary" | "neutral" }> = {
  Sekolah: { label: "Sekolah", variant: "secondary" },
  Kabupaten: { label: "Kabupaten", variant: "warning" },
  Provinsi: { label: "Provinsi", variant: "success" },
  Nasional: { label: "Nasional", variant: "success" },
  Internasional: { label: "Internasional", variant: "primary" },
};

export default function AchievementsPage() {
  const [data, setData] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [students, setStudents] = useState<Student[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Achievement | null>(null);

  useEffect(() => {
    studentService
      .list({ per_page: 100 })
      .then((res: { data: Student[] }) => setStudents(res.data))
      .catch(() => {
        toast.error("Gagal memuat data siswa");
      });
  }, []);

  const loadData = () => {
    setLoading(true);
    setError(null);

    achievementService
      .list()
      .then((res: { data: Achievement[] }) => {
        setData(res.data);
      })
      .catch((err: unknown) => {
        const apiError = toApiError(err);
        setError(apiError);
        setData([]);
        toast.error("Gagal memuat data prestasi", {
          description: apiError.message,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaved = () => {
    setFormOpen(false);
    setEditing(null);
    loadData();
  };

  const handleDeleted = () => {
    setDeleteOpen(false);
    setToDelete(null);
    loadData();
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (row: Achievement) => {
    setEditing(row);
    setFormOpen(true);
  };

  const openDelete = (row: Achievement) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const studentName = (id: number) => {
    const s = students.find((st) => st.id === id);
    return s?.name ?? `#${id}`;
  };

  const columns = useMemo(() => {
    type Row = Achievement;
    return [
      {
        header: "Siswa",
        accessor: "student_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="font-medium text-on-surface">{studentName(row.student_id ?? 0)}</span>
        ),
      },
      {
        header: "Judul",
        accessor: "title" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{row.title || "-"}</span>
        ),
      },
      {
        header: "Tanggal",
        accessor: "achievement_date" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{row.achievement_date || "-"}</span>
        ),
      },
      {
        header: "Tingkat",
        accessor: "level" as keyof Row,
        headerClassName: "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => {
          const level = (row.level as AchievementLevel) ?? "Sekolah";
          const meta = LEVEL_BADGE[level] || { variant: "secondary", label: level ?? "Sekolah" };
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
              aria-label={`Edit prestasi ${row.title ?? row.id}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label={`Hapus prestasi ${row.title ?? row.id}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [openEdit, openDelete, students]);

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Prestasi"
        description="Kelola data prestasi siswa."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data prestasi.</p>
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
                  Tidak ada prestasi.
                </div>
              ) : (
                data.map((row) => (
                  <div key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-on-surface">{row.title || "-"}</p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          Siswa: {studentName(row.student_id ?? 0)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {row.achievement_date} — {row.level}
                        </p>
                      </div>
                      <Badge
                        variant={LEVEL_BADGE[row.level as AchievementLevel]?.variant ?? "secondary"}
                        className="shrink-0 px-2.5 py-1 text-xs leading-4"
                      >
                        {LEVEL_BADGE[row.level as AchievementLevel]?.label ?? row.level}
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
              <DataTable columns={columns} data={data} loading={loading} emptyMessage="Tidak ada prestasi." />
            </div>
          </>
        )}
      </Card>

      <AchievementForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <AchievementDeleteDialog
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