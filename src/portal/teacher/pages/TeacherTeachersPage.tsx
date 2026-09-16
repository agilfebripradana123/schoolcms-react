import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import apiClient from "@/lib/api/axios";
import { toApiError } from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import AppSelect from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";
import TeacherTeacherForm from "../components/TeacherTeacherForm";
import TeacherTeacherDeleteDialog from "../components/TeacherTeacherDeleteDialog";

interface Teacher {
  id: number;
  nip?: string | null;
  name: string;
  email: string;
  status?: string | null;
}

const statusOptions: SelectOption<string>[] = [
  { value: "aktif", label: "Aktif" },
  { value: "nonaktif", label: "Nonaktif" },
];

export default function TeacherTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filtered, setFiltered] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Teacher | null>(null);
  const [query, setQuery] = useState<{ search: string; status: string | null }>({ search: "", status: null });

  const searchTimeout = useRef<number | null>(null);

  const openCreate = () => { setSelected(null); setFormOpen(true); };
  const openEdit = (t: Teacher) => { setSelected(t); setFormOpen(true); };
  const openDelete = (t: Teacher) => { setSelected(t); setDeleteOpen(true); };

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: Teacher[] }>("/teachers", { params: { search: query.search || undefined, status: query.status || undefined } })
      .then((res) => {
        const data = res.data.data ?? [];
        setTeachers(data);
        setFiltered(data);
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

  const handleStatusChange = useCallback((value: string | null) => {
    setStatus(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, status: value }));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Data Guru" description="Daftar guru yang terdaftar di sistem." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Data Guru" description="Daftar guru yang terdaftar di sistem." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (teachers.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="Data Guru"
          description="Daftar guru yang terdaftar di sistem."
          actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Tambah</Button>}
        />
        <PortalEmptyState icon={<Users />} description="Belum ada data guru." />
        <TeacherTeacherForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} initialData={selected} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Data Guru"
        description="Daftar guru yang terdaftar di sistem."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Tambah</Button>}
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari nama, email, atau NIP..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Status</span>
              <AppSelect options={statusOptions} value={status} onChange={handleStatusChange} placeholder="Pilih Status" isSearchable={false} className="min-w-[180px]" />
            </label>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "nip" as keyof Teacher, header: "NIP", render: (_val, t) => t.nip ?? "—" },
              { accessor: "name" as keyof Teacher, header: "Nama", render: (_val, t) => t.name },
              { accessor: "email" as keyof Teacher, header: "Email", render: (_val, t) => t.email },
              {
                accessor: "status" as keyof Teacher,
                header: "Status",
                render: (_val, t) =>
                  t.status ? <Badge variant="secondary">{t.status}</Badge> : <span className="text-secondary">—</span>,
              },
              {
                accessor: "id" as keyof Teacher,
                header: "Aksi",
                render: (_val, t) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openDelete(t)}><Trash2 className="h-4 w-4 text-error" /></Button>
                  </div>
                ),
              },
            ]}
            data={filtered}
          />
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((t) => (
            <Card key={t.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-primary">{t.name}</p>
                    <p className="text-sm text-secondary">{t.nip ?? "—"}</p>
                  </div>
                  {t.status && <Badge variant="secondary">{t.status}</Badge>}
                </div>
                <p className="text-sm text-secondary">{t.email}</p>
                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => openDelete(t)}><Trash2 className="h-4 w-4 mr-1 text-error" />Hapus</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && teachers.length > 0 && (
          <PortalEmptyState icon={<Users />} description="Tidak ada guru yang sesuai dengan pencarian." />
        )}
      </Card>

      <TeacherTeacherForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} initialData={selected} />
      <TeacherTeacherDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onDeleted={() => { setDeleteOpen(false); load(); }} data={selected} />
    </PageContainer>
  );
}
