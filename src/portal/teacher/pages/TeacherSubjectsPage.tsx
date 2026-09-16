import { useCallback, useEffect, useRef, useState } from "react";
import { Library, Pencil, Plus, Trash2 } from "lucide-react";
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
import TeacherSubjectForm from "../components/TeacherSubjectForm";
import TeacherSubjectDeleteDialog from "../components/TeacherSubjectDeleteDialog";

interface Subject {
  id: number;
  name?: string | null;
  code?: string | null;
  category?: string | null;
}

export default function TeacherSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filtered, setFiltered] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Subject | null>(null);
  const [query, setQuery] = useState<{ search: string }>({ search: "" });

  const searchTimeout = useRef<number | null>(null);

  const openCreate = () => { setSelected(null); setFormOpen(true); };
  const openEdit = (s: Subject) => { setSelected(s); setFormOpen(true); };
  const openDelete = (s: Subject) => { setSelected(s); setDeleteOpen(true); };

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: Subject[] }>("/teacher/subjects", { params: { search: query.search || undefined } })
      .then((res) => {
        const items = res.data.data ?? [];
        setSubjects(items);
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
        <PageHeader title="Mata Pelajaran" description="Daftar mata pelajaran." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Mata Pelajaran" description="Daftar mata pelajaran." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (subjects.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="Mata Pelajaran"
          description="Daftar mata pelajaran."
          actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Tambah</Button>}
        />
        <PortalEmptyState icon={<Library />} description="Belum ada data mata pelajaran." />
        <TeacherSubjectForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} initialData={selected} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Mata Pelajaran"
        description="Daftar mata pelajaran."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Tambah</Button>}
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari nama, kode, atau kategori..." />
          </div>
        </div>

        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "name" as keyof Subject, header: "Nama", render: (_val, s) => s.name ?? "—" },
              { accessor: "code" as keyof Subject, header: "Kode", render: (_val, s) => s.code ?? "—" },
              { accessor: "category" as keyof Subject, header: "Kategori", render: (_val, s) => s.category ?? "—" },
              {
                accessor: "id" as keyof Subject,
                header: "Aksi",
                render: (_val, s) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openDelete(s)}><Trash2 className="h-4 w-4 text-error" /></Button>
                  </div>
                ),
              },
            ]}
            data={filtered}
          />
        </div>

        <div className="md:hidden space-y-3">
          {filtered.map((s) => (
            <Card key={s.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <p className="font-semibold text-primary">{s.name ?? "—"}</p>
                <p className="text-sm text-secondary">Kode: {s.code ?? "—"}</p>
                <p className="text-sm text-secondary">Kategori: {s.category ?? "—"}</p>
                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => openDelete(s)}><Trash2 className="h-4 w-4 mr-1 text-error" />Hapus</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && subjects.length > 0 && (
          <PortalEmptyState icon={<Library />} description="Tidak ada mata pelajaran yang sesuai dengan pencarian." />
        )}
      </Card>

      <TeacherSubjectForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} initialData={selected} />
      <TeacherSubjectDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onDeleted={() => { setDeleteOpen(false); load(); }} data={selected} />
    </PageContainer>
  );
}
