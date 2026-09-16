import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
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
import TeacherAcademicYearForm from "../components/TeacherAcademicYearForm";
import TeacherAcademicYearDeleteDialog from "../components/TeacherAcademicYearDeleteDialog";

interface AcademicYear {
  id: number;
  year?: string | null;
  semester?: string | null;
  status?: string | null;
}

const statusOptions: SelectOption<string>[] = [
  { value: "aktif", label: "Aktif" },
  { value: "tidak aktif", label: "Tidak Aktif" },
];

export default function TeacherAcademicYearsPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [filtered, setFiltered] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<AcademicYear | null>(null);
  const [query, setQuery] = useState<{ search: string; status: string | null }>({ search: "", status: null });

  const searchTimeout = useRef<number | null>(null);

  const openCreate = () => { setSelected(null); setFormOpen(true); };
  const openEdit = (y: AcademicYear) => { setSelected(y); setFormOpen(true); };
  const openDelete = (y: AcademicYear) => { setSelected(y); setDeleteOpen(true); };

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: AcademicYear[] }>("/teacher/academic-years", { params: { search: query.search || undefined, status: query.status || undefined } })
      .then((res) => {
        const items = res.data.data ?? [];
        setYears(items);
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
        <PageHeader title="Tahun Ajaran" description="Daftar tahun ajaran." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Tahun Ajaran" description="Daftar tahun ajaran." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (years.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="Tahun Ajaran"
          description="Daftar tahun ajaran."
          actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Tambah</Button>}
        />
        <PortalEmptyState icon={<CalendarDays />} description="Belum ada data tahun ajaran." />
        <TeacherAcademicYearForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} initialData={selected} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Tahun Ajaran"
        description="Daftar tahun ajaran."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Tambah</Button>}
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari tahun atau semester..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Status</span>
              <AppSelect options={statusOptions} value={status} onChange={handleStatusChange} placeholder="Pilih Status" isSearchable={false} className="min-w-[180px]" />
            </label>
          </div>
        </div>

        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "year" as keyof AcademicYear, header: "Tahun", render: (_val, y) => y.year ?? "—" },
              { accessor: "semester" as keyof AcademicYear, header: "Semester", render: (_val, y) => y.semester ?? "—" },
              {
                accessor: "status" as keyof AcademicYear,
                header: "Status",
                render: (_val, y) => y.status ? <Badge variant="secondary">{y.status}</Badge> : <span className="text-secondary">—</span>,
              },
              {
                accessor: "id" as keyof AcademicYear,
                header: "Aksi",
                render: (_val, y) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(y)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openDelete(y)}><Trash2 className="h-4 w-4 text-error" /></Button>
                  </div>
                ),
              },
            ]}
            data={filtered}
          />
        </div>

        <div className="md:hidden space-y-3">
          {filtered.map((y) => (
            <Card key={y.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-primary">{y.year ?? "—"}</p>
                  {y.status && <Badge variant="secondary">{y.status}</Badge>}
                </div>
                <p className="text-sm text-secondary">Semester: {y.semester ?? "—"}</p>
                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(y)}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => openDelete(y)}><Trash2 className="h-4 w-4 mr-1 text-error" />Hapus</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && years.length > 0 && (
          <PortalEmptyState icon={<CalendarDays />} description="Tidak ada tahun ajaran yang sesuai dengan pencarian." />
        )}
      </Card>

      <TeacherAcademicYearForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} initialData={selected} />
      <TeacherAcademicYearDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onDeleted={() => { setDeleteOpen(false); load(); }} data={selected} />
    </PageContainer>
  );
}
