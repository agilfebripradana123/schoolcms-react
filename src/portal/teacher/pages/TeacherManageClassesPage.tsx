import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil, Plus, School, Trash2 } from "lucide-react";
import apiClient from "@/lib/api/axios";
import { toApiError } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import TeacherClassForm from "../components/TeacherClassForm";
import TeacherClassDeleteDialog from "../components/TeacherClassDeleteDialog";

interface Class {
  id: number;
  name?: string | null;
  homeroom_teacher?: string | null;
  student_count?: number | string | null;
}

export default function TeacherManageClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [filtered, setFiltered] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Class | null>(null);
  const [query, setQuery] = useState<{ search: string }>({ search: "" });

  const searchTimeout = useRef<number | null>(null);

  const openCreate = () => { setSelected(null); setFormOpen(true); };
  const openEdit = (c: Class) => { setSelected(c); setFormOpen(true); };
  const openDelete = (c: Class) => { setSelected(c); setDeleteOpen(true); };

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: Class[] }>("/teacher/classes", { params: { search: query.search || undefined } })
      .then((res) => {
        const items = res.data.data ?? [];
        setClasses(items);
        setFiltered(items);
      })
      .catch((err) => setError(toApiError(err).message))
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    searchTimeout.current = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      setQuery((prev) => ({ ...prev, search: value }));
    }, 400);
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
            <Search value={search} onChange={handleSearchChange} placeholder="Cari nama kelas atau wali kelas..." />
          </div>
        </div>

        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "name" as keyof Class, header: "Nama Kelas", render: (_val, c) => c.name ?? "—" },
              { accessor: "homeroom_teacher" as keyof Class, header: "Wali Kelas", render: (_val, c) => c.homeroom_teacher ?? "—" },
              { accessor: "student_count" as keyof Class, header: "Jumlah Siswa", render: (_val, c) => c.student_count ?? "—" },
              {
                accessor: "id" as keyof Class,
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
                <p className="text-sm text-secondary">Wali Kelas: {c.homeroom_teacher ?? "—"}</p>
                <p className="text-sm text-secondary">Jumlah Siswa: {c.student_count ?? "—"}</p>
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
