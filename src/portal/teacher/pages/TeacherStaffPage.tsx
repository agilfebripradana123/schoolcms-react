import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
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
import TeacherStaffForm from "../components/TeacherStaffForm";
import TeacherStaffDeleteDialog from "../components/TeacherStaffDeleteDialog";

interface Staff {
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

export default function TeacherStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filtered, setFiltered] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Staff | null>(null);
  const [query, setQuery] = useState<{ search: string; status: string | null }>({ search: "", status: null });

  const searchTimeout = useRef<number | null>(null);

  const openCreate = () => { setSelected(null); setFormOpen(true); };
  const openEdit = (s: Staff) => { setSelected(s); setFormOpen(true); };
  const openDelete = (s: Staff) => { setSelected(s); setDeleteOpen(true); };

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: Staff[] }>("/teacher/staff", { params: { search: query.search || undefined, status: query.status || undefined } })
      .then((res) => {
        const data = res.data.data ?? [];
        setStaff(data);
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
        <PageHeader title="Tenaga Kependidikan" description="Daftar tenaga kependidikan." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Tenaga Kependidikan" description="Daftar tenaga kependidikan." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (staff.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="Tenaga Kependidikan"
          description="Daftar tenaga kependidikan."
          actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Tambah</Button>}
        />
        <PortalEmptyState icon={<Users />} description="Belum ada data tenaga kependidikan." />
        <TeacherStaffForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} initialData={selected} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Tenaga Kependidikan"
        description="Daftar tenaga kependidikan."
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
              { accessor: "nip" as keyof Staff, header: "NIP", render: (_val, s) => s.nip ?? "—" },
              { accessor: "name" as keyof Staff, header: "Nama", render: (_val, s) => s.name },
              { accessor: "email" as keyof Staff, header: "Email", render: (_val, s) => s.email },
              {
                accessor: "status" as keyof Staff,
                header: "Status",
                render: (_val, s) =>
                  s.status ? <Badge variant="secondary">{s.status}</Badge> : <span className="text-secondary">—</span>,
              },
              {
                accessor: "id" as keyof Staff,
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

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((s) => (
            <Card key={s.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-primary">{s.name}</p>
                    <p className="text-sm text-secondary">{s.nip ?? "—"}</p>
                  </div>
                  {s.status && <Badge variant="secondary">{s.status}</Badge>}
                </div>
                <p className="text-sm text-secondary">{s.email}</p>
                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => openDelete(s)}><Trash2 className="h-4 w-4 mr-1 text-error" />Hapus</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && staff.length > 0 && (
          <PortalEmptyState icon={<Users />} description="Tidak ada staff yang sesuai dengan pencarian." />
        )}
      </Card>

      <TeacherStaffForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} initialData={selected} />
      <TeacherStaffDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onDeleted={() => { setDeleteOpen(false); load(); }} data={selected} />
    </PageContainer>
  );
}
