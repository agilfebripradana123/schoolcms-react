import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, School, Trash2 } from "lucide-react";
import apiClient from "@/lib/api/axios";
import { TEACHER_MANAGE, toApiError } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import { teacherService } from "@/features/teachers-staff/api/teacher.service";
import { formatTeacherName, type Teacher } from "@/features/teachers-staff/api/types";
import type { SchoolClass } from "@/features/academic/api/types";
import TeacherClassForm from "../components/TeacherClassForm";
import TeacherClassDeleteDialog from "../components/TeacherClassDeleteDialog";

interface ClassListResponse {
  success: boolean;
  message: string;
  data: SchoolClass[];
}

export default function TeacherManageClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<SchoolClass | null>(null);

  const openCreate = () => { setSelected(null); setFormOpen(true); };
  const openEdit = (c: SchoolClass) => { setSelected(c); setFormOpen(true); };
  const openDelete = (c: SchoolClass) => { setSelected(c); setDeleteOpen(true); };

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<ClassListResponse>(TEACHER_MANAGE.CLASSES)
      .then((res) => {
        const items = res.data.data ?? [];
        setClasses(items);
      })
      .catch((err) => setError(toApiError(err).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    teacherService
      .list({ per_page: 100 })
      .then((res) => setTeachers(res.data))
      .catch(() => {});
  }, []);

  const teacherNameById = useMemo(() => {
    const map: Record<number, string> = {};
    for (const t of teachers) map[t.id] = formatTeacherName(t);
    return map;
  }, [teachers]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return classes;
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(keyword) ||
        (c.level ?? "").toLowerCase().includes(keyword) ||
        (c.teacher_id != null ? teacherNameById[c.teacher_id] ?? "" : "").toLowerCase().includes(keyword),
    );
  }, [classes, search, teacherNameById]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Kelola Kelas" description="Daftar kelas yang terdaftar." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Kelola Kelas" description="Daftar kelas yang terdaftar." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (classes.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="Kelola Kelas"
          description="Daftar kelas yang terdaftar."
          actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Tambah</Button>}
        />
        <PortalEmptyState icon={<School />} description="Belum ada data kelas." />
        <TeacherClassForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} initialData={selected} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Kelola Kelas"
        description="Daftar kelas yang terdaftar."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Tambah</Button>}
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari nama kelas, tingkat, atau wali kelas..." />
          </div>
        </div>

        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "name" as keyof SchoolClass, header: "Nama Kelas", render: (_val, c) => c.name ?? "—" },
              { accessor: "level" as keyof SchoolClass, header: "Tingkat", render: (_val, c) => c.level ?? "—" },
              { accessor: "academic_year" as keyof SchoolClass, header: "Tahun Ajaran", render: (_val, c) => c.academic_year ?? "—" },
              {
                accessor: "teacher_id" as keyof SchoolClass,
                header: "Wali Kelas",
                render: (_val, c) =>
                  c.teacher_id != null ? teacherNameById[c.teacher_id] ?? `#${c.teacher_id}` : "—",
              },
              {
                accessor: "id" as keyof SchoolClass,
                header: "Aksi",
                render: (_val, c) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openDelete(c)}><Trash2 className="h-4 w-4 text-error" /></Button>
                  </div>
                ),
              },
            ]}
            data={filtered}
          />
        </div>

        <div className="md:hidden space-y-3">
          {filtered.map((c) => (
            <Card key={c.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <p className="font-semibold text-primary">{c.name ?? "—"}</p>
                <p className="text-sm text-secondary">Tingkat: {c.level ?? "—"}</p>
                <p className="text-sm text-secondary">Tahun Ajaran: {c.academic_year ?? "—"}</p>
                <p className="text-sm text-secondary">
                  Wali Kelas: {c.teacher_id != null ? teacherNameById[c.teacher_id] ?? `#${c.teacher_id}` : "—"}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => openDelete(c)}><Trash2 className="h-4 w-4 mr-1 text-error" />Hapus</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && classes.length > 0 && (
          <PortalEmptyState icon={<School />} description="Tidak ada kelas yang sesuai dengan pencarian." />
        )}
      </Card>

      <TeacherClassForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} initialData={selected} />
      <TeacherClassDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onDeleted={() => { setDeleteOpen(false); load(); }} data={selected} />
    </PageContainer>
  );
}