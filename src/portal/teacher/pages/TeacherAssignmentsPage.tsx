import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Search from "@/components/ui/Search";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { usePermission } from "@/features/auth/usePermission";
import { myAssignmentService } from "@/features/academic";
import type { Assignment } from "@/features/academic/api/types";
import { toApiError } from "@/lib/api";
import type { SelectOption } from "@/components/ui/Select";

interface FormState {
  title: string;
  description: string;
  class_id: number | null;
  subject_id: number | null;
  academic_year_id: number | null;
  due_date: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  class_id: null,
  subject_id: null,
  academic_year_id: null,
  due_date: "",
};

export default function TeacherAssignmentsPage() {
  const { can } = usePermission();
  const canManage = can("manage-assignments");

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [meta, setMeta] = useState<{ total: number; last_page: number; current_page: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [classFilter, setClassFilter] = useState<number | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<number | null>(null);
  const [yearFilter, setYearFilter] = useState<number | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Assignment | null>(null);

  // Scope options untuk filter & form (dari assignment milik guru).
  const [scopeAssignments, setScopeAssignments] = useState<Assignment[]>([]);

  const loadScope = useCallback(() => {
    myAssignmentService
      .list({ per_page: 100 })
      .then((res) => setScopeAssignments(res.data ?? []))
      .catch(() => setScopeAssignments([]));
  }, []);

  const load = useCallback(
    (pageNum: number, q: string, classId: number | null, subjectId: number | null, yearId: number | null) => {
      setLoading(true);
      setError(null);
      myAssignmentService
        .list({
          page: pageNum,
          per_page: 15,
          q: q || undefined,
          class_id: classId ?? undefined,
          subject_id: subjectId ?? undefined,
          academic_year_id: yearId ?? undefined,
        })
        .then((res) => {
          setAssignments(res.data ?? []);
          setMeta(res.meta ?? null);
        })
        .catch((err) => setError(toApiError(err).message))
        .finally(() => setLoading(false));
    },
    [],
  );

  useEffect(() => {
    loadScope();
    load(page, search, classFilter, subjectFilter, yearFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    setPage(1);
    load(1, search, classFilter, subjectFilter, yearFilter);
  };

  const classOptions = useMemo<SelectOption<number>[]>(() => {
    const seen = new Map<number, string>();
    for (const a of scopeAssignments) seen.set(a.class_id, a.class?.name ?? `Kelas ${a.class_id}`);
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }, [scopeAssignments]);

  const subjectOptions = useMemo<SelectOption<number>[]>(() => {
    const seen = new Map<number, string>();
    const activeClass = formOpen ? form.class_id : classFilter;
    const activeYear = formOpen ? form.academic_year_id : yearFilter;
    for (const a of scopeAssignments) {
      if (activeClass !== null && a.class_id !== activeClass) continue;
      if (activeYear !== null && a.academic_year_id !== activeYear) continue;
      seen.set(a.subject_id, a.subject?.name ?? `Mapel ${a.subject_id}`);
    }
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }, [scopeAssignments, classFilter, yearFilter, form.class_id, form.academic_year_id, formOpen]);

  const yearOptions = useMemo<SelectOption<number>[]>(() => {
    const seen = new Map<number, string>();
    for (const a of scopeAssignments) {
      if (a.academic_year_id == null) continue;
      seen.set(a.academic_year_id, a.academic_year?.name ?? `Tahun ${a.academic_year_id}`);
    }
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }, [scopeAssignments]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (a: Assignment) => {
    setEditing(a);
    setForm({
      title: a.title,
      description: a.description ?? "",
      class_id: a.class_id,
      subject_id: a.subject_id,
      academic_year_id: a.academic_year_id ?? null,
      due_date: a.due_date ?? "",
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.class_id || !form.subject_id || form.title.trim() === "") {
      toast.error("Lengkapi judul, kelas, dan mata pelajaran.");
      return;
    }
    const academic_year_id =
      form.academic_year_id ??
      scopeAssignments.find(
        (a) => a.class_id === form.class_id && a.subject_id === form.subject_id,
      )?.academic_year_id ??
      null;
    if (!academic_year_id) {
      toast.error("Pilih tahun ajaran untuk kelas/mapel ini.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await myAssignmentService.update(editing.id, {
          title: form.title,
          description: form.description || undefined,
          class_id: form.class_id,
          subject_id: form.subject_id,
          academic_year_id,
          due_date: form.due_date || undefined,
        });
        toast.success("Tugas diperbarui.");
      } else {
        await myAssignmentService.create({
          title: form.title,
          description: form.description || undefined,
          class_id: form.class_id,
          subject_id: form.subject_id,
          due_date: form.due_date || undefined,
          academic_year_id,
        });
        toast.success("Tugas dibuat.");
      }
      setFormOpen(false);
      loadScope();
      load(page, search, classFilter, subjectFilter, yearFilter);
    } catch (err) {
      toast.error("Gagal menyimpan tugas", { description: toApiError(err).message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await myAssignmentService.remove(toDelete.id);
      toast.success("Tugas dihapus.");
      setToDelete(null);
      load(page, search, classFilter, subjectFilter, yearFilter);
    } catch (err) {
      toast.error("Gagal menghapus tugas", { description: toApiError(err).message });
    }
  };

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Tugas"
        description="Tugas pada kelas & mata pelajaran yang menjadi scope mengajar Anda."
        actions={
          canManage ? (
            <Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
              Tambah Tugas
            </Button>
          ) : undefined
        }
      />

      <Card>
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Cari Judul
            </label>
            <Search value={search} onChange={setSearch} placeholder="Cari judul..." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Kelas
            </label>
            <Select<number> options={classOptions} value={classFilter} onChange={setClassFilter} placeholder="Semua kelas" isClearable />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Mata Pelajaran
            </label>
            <Select<number> options={subjectOptions} value={subjectFilter} onChange={setSubjectFilter} placeholder="Semua mapel" isClearable />
          </div>
        </div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div className="w-full sm:w-64">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Tahun Ajaran
            </label>
            <Select<number> options={yearOptions} value={yearFilter} onChange={setYearFilter} placeholder="Semua tahun" isClearable />
          </div>
          <Button onClick={applyFilters} disabled={loading}>
            Tampilkan
          </Button>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">{error}</p>
            <Button variant="secondary" size="sm" onClick={applyFilters}>
              Muat Ulang
            </Button>
          </div>
        ) : (
            <DataTable<Assignment>
              loading={loading}
              emptyMessage="Belum ada tugas."
              columns={[
                { header: "No", accessor: "id", render: (_v, row) => assignments.findIndex((a) => a.id === row.id) + 1 },
                { header: "Judul", accessor: "title", render: (v) => <span className="font-semibold text-on-surface">{String(v ?? "-")}</span> },
                { header: "Mata Pelajaran", accessor: "id", render: (_v, row) => row.subject?.name ?? "-" },
                { header: "Kelas", accessor: "id", render: (_v, row) => row.class?.name ?? "-" },
                {
                  header: "Tahun Ajaran",
                  accessor: "id",
                  render: (_v, row) => {
                    const name = row.academic_year?.name;
                    return name ? <Badge variant="neutral">{name}</Badge> : "-";
                  },
                },
                { header: "Deadline", accessor: "due_date", render: (v) => (v ? String(v) : "-") },
                {
                  header: "Aksi",
                  accessor: "id",
                  render: (_v, row) =>
                    canManage ? (
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => openEdit(row)} className="rounded-xl p-2 text-on-surface-variant hover:bg-surface-container-high" aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setToDelete(row)} className="rounded-xl p-2 text-error hover:bg-error-container/60" aria-label="Hapus">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-on-surface-variant">—</span>
                    ),
                },
              ]}
              data={assignments}
            />
        )}
        {meta && meta.last_page > 1 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-on-surface-variant">
              Menampilkan{" "}
              {(meta.current_page - 1) * 15 + 1}–{Math.min(meta.current_page * 15, meta.total)}{" "}
              dari {meta.total} data
            </p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1 || loading} onClick={() => { const n = page - 1; setPage(n); load(n, search, classFilter, subjectFilter, yearFilter); }}>
                Sebelumnya
              </Button>
              <span className="text-sm text-on-surface-variant">
                Halaman {meta.current_page} dari {meta.last_page}
              </span>
              <Button variant="secondary" size="sm" disabled={page >= (meta.last_page ?? 1) || loading} onClick={() => { const n = page + 1; setPage(n); load(n, search, classFilter, subjectFilter, yearFilter); }}>
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Hapus tugas?"
        description={toDelete ? `Tugas "${toDelete.title}" akan dihapus.` : ""}
        confirmText="Hapus"
        cancelText="Batal"
        destructive
        onConfirm={handleDelete}
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Tugas" : "Tambah Tugas"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">Judul</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-primary-container focus:outline-none"
              placeholder="Judul tugas"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-primary-container focus:outline-none"
              placeholder="Deskripsi opsional"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">Kelas</label>
              <Select<number>
                options={classOptions}
                value={form.class_id}
                onChange={(v) => setForm({ ...form, class_id: v, subject_id: null })}
                placeholder="Pilih kelas"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">Mata Pelajaran</label>
              <Select<number>
                options={subjectOptions}
                value={form.subject_id}
                onChange={(v) => setForm({ ...form, subject_id: v })}
                placeholder="Pilih mapel"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">Tahun Ajaran</label>
            <Select<number>
              options={yearOptions}
              value={form.academic_year_id}
              onChange={(v) => setForm({ ...form, academic_year_id: v })}
              placeholder="Pilih tahun ajaran"
              isClearable
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">Deadline</label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-primary-container focus:outline-none"
            />
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
