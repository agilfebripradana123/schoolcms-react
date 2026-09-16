import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarClock, Pencil, Plus, Trash2 } from "lucide-react";
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
import AppSelect from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";
import TeacherScheduleForm from "../components/TeacherScheduleForm";
import TeacherScheduleDeleteDialog from "../components/TeacherScheduleDeleteDialog";

interface Schedule {
  id: number;
  day?: string | null;
  time?: string | null;
  class?: string | null;
  subject?: string | null;
  semester?: string | null;
}

const semesterOptions: SelectOption<string>[] = [
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
];

export default function TeacherManageSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filtered, setFiltered] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Schedule | null>(null);
  const [query, setQuery] = useState<{ search: string; semester: string | null }>({ search: "", semester: null });

  const searchTimeout = useRef<number | null>(null);

  const openCreate = () => { setSelected(null); setFormOpen(true); };
  const openEdit = (s: Schedule) => { setSelected(s); setFormOpen(true); };
  const openDelete = (s: Schedule) => { setSelected(s); setDeleteOpen(true); };

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: Schedule[] }>("/teacher/schedules", { params: { search: query.search || undefined, semester: query.semester || undefined } })
      .then((res) => {
        const items = res.data.data ?? [];
        setSchedules(items);
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

  const handleSemesterChange = useCallback((value: string | null) => {
    setSemester(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, semester: value }));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Jadwal Pelajaran" description="Daftar jadwal pelajaran." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Jadwal Pelajaran" description="Daftar jadwal pelajaran." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (schedules.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="Jadwal Pelajaran"
          description="Daftar jadwal pelajaran."
          actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Tambah</Button>}
        />
        <PortalEmptyState icon={<CalendarClock />} description="Belum ada data jadwal." />
        <TeacherScheduleForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} initialData={selected} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Jadwal Pelajaran"
        description="Daftar jadwal pelajaran."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Tambah</Button>}
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari hari, kelas, atau mata pelajaran..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Semester</span>
              <AppSelect options={semesterOptions} value={semester} onChange={handleSemesterChange} placeholder="Pilih Semester" isSearchable={false} className="min-w-[180px]" />
            </label>
          </div>
        </div>

        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "day" as keyof Schedule, header: "Hari", render: (_val, s) => s.day ?? "—" },
              { accessor: "time" as keyof Schedule, header: "Jam", render: (_val, s) => s.time ?? "—" },
              { accessor: "class" as keyof Schedule, header: "Kelas", render: (_val, s) => s.class ?? "—" },
              { accessor: "subject" as keyof Schedule, header: "Mata Pelajaran", render: (_val, s) => s.subject ?? "—" },
              {
                accessor: "id" as keyof Schedule,
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
                <p className="font-semibold text-primary">{s.day ?? "—"} - {s.time ?? "—"}</p>
                <p className="text-sm text-secondary">Kelas: {s.class ?? "—"}</p>
                <p className="text-sm text-secondary">Mapel: {s.subject ?? "—"}</p>
                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => openDelete(s)}><Trash2 className="h-4 w-4 mr-1 text-error" />Hapus</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && schedules.length > 0 && (
          <PortalEmptyState icon={<CalendarClock />} description="Tidak ada jadwal yang sesuai dengan pencarian." />
        )}
      </Card>

      <TeacherScheduleForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} initialData={selected} />
      <TeacherScheduleDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onDeleted={() => { setDeleteOpen(false); load(); }} data={selected} />
    </PageContainer>
  );
}
