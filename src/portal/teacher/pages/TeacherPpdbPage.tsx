import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import apiClient from "@/lib/api/axios";
import { toApiError } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import AppSelect from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";
import TeacherPpdbForm from "../components/TeacherPpdbForm";
import TeacherPpdbDeleteDialog from "../components/TeacherPpdbDeleteDialog";

interface PpdbRegistration {
  id: number;
  name?: string | null;
  email?: string | null;
  status?: string | null;
  registration_date?: string | null;
}

const statusOptions: SelectOption<string>[] = [
  { value: "menunggu", label: "Menunggu" },
  { value: "diterima", label: "Diterima" },
  { value: "ditolak", label: "Ditolak" },
];

export default function TeacherPpdbPage() {
  const [registrations, setRegistrations] = useState<PpdbRegistration[]>([]);
  const [filtered, setFiltered] = useState<PpdbRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<PpdbRegistration | null>(null);
  const [query, setQuery] = useState<{ search: string; status: string | null }>({ search: "", status: null });

  const searchTimeout = useRef<number | null>(null);

  const openCreate = () => { setSelected(null); setFormOpen(true); };
  const openEdit = (r: PpdbRegistration) => { setSelected(r); setFormOpen(true); };
  const openDelete = (r: PpdbRegistration) => { setSelected(r); setDeleteOpen(true); };

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: PpdbRegistration[] }>("/teacher/ppdb/registrations", { params: { search: query.search || undefined, status: query.status || undefined } })
      .then((res) => {
        const items = res.data.data ?? [];
        setRegistrations(items);
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

  const handleStatusChange = useCallback((value: string | null) => {
    setStatus(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, status: value }));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="PPDB" description="Daftar pendaftar PPDB." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="PPDB" description="Daftar pendaftar PPDB." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (registrations.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="PPDB"
          description="Daftar pendaftar PPDB."
          actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Tambah</Button>}
        />
        <PortalEmptyState icon={<UserPlus />} description="Belum ada data pendaftar." />
        <TeacherPpdbForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} initialData={selected} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="PPDB"
        description="Daftar pendaftar PPDB."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Tambah</Button>}
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari nama atau email..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Status Verifikasi</span>
              <AppSelect options={statusOptions} value={status} onChange={handleStatusChange} placeholder="Pilih Status" isSearchable={false} className="min-w-[180px]" />
            </label>
          </div>
        </div>

        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "name" as keyof PpdbRegistration, header: "Nama", render: (_val, r) => r.name ?? "—" },
              { accessor: "email" as keyof PpdbRegistration, header: "Email", render: (_val, r) => r.email ?? "—" },
              {
                accessor: "status" as keyof PpdbRegistration,
                header: "Status",
                render: (_val, r) => r.status ? <Badge variant="secondary">{r.status}</Badge> : <span className="text-secondary">—</span>,
              },
              { accessor: "registration_date" as keyof PpdbRegistration, header: "Tanggal Daftar", render: (_val, r) => r.registration_date ?? "—" },
              {
                accessor: "id" as keyof PpdbRegistration,
                header: "Aksi",
                render: (_val, r) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openDelete(r)}><Trash2 className="h-4 w-4 text-error" /></Button>
                  </div>
                ),
              },
            ]}
            data={filtered}
          />
        </div>

        <div className="md:hidden space-y-3">
          {filtered.map((r) => (
            <Card key={r.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-primary">{r.name ?? "—"}</p>
                  {r.status && <Badge variant="secondary">{r.status}</Badge>}
                </div>
                <p className="text-sm text-secondary">{r.email ?? "—"}</p>
                <p className="text-sm text-secondary">Tanggal: {r.registration_date ?? "—"}</p>
                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => openDelete(r)}><Trash2 className="h-4 w-4 mr-1 text-error" />Hapus</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && registrations.length > 0 && (
          <PortalEmptyState icon={<UserPlus />} description="Tidak ada pendaftar yang sesuai dengan pencarian." />
        )}
      </Card>

      <TeacherPpdbForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} initialData={selected} />
      <TeacherPpdbDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onDeleted={() => { setDeleteOpen(false); load(); }} data={selected} />
    </PageContainer>
  );
}
