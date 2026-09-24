import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Pencil, Plus, Trash2 } from "lucide-react";
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
import Pagination, { type PaginationMeta } from "@/components/ui/Pagination";
import AppSelect from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";
import { semesterService } from "@/features/academic/api/semester.service";
import type { Schedule, ScheduleDay, Semester } from "@/features/academic/api/types";
import TeacherScheduleForm from "../components/TeacherScheduleForm";
import TeacherScheduleDeleteDialog from "../components/TeacherScheduleDeleteDialog";

const PER_PAGE = 10;

const DAY_LABELS: Record<ScheduleDay, string> = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
};

interface ScheduleListResponse {
  success: boolean;
  message: string;
  data: Schedule[];
  meta: PaginationMeta;
}

export default function TeacherManageSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [semesterId, setSemesterId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Schedule | null>(null);

  const openCreate = () => { setSelected(null); setFormOpen(true); };
  const openEdit = (s: Schedule) => { setSelected(s); setFormOpen(true); };
  const openDelete = (s: Schedule) => { setSelected(s); setDeleteOpen(true); };

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<ScheduleListResponse>(TEACHER_MANAGE.SCHEDULES, {
        params: {
          semester_id: semesterId || undefined,
          page,
          per_page: PER_PAGE,
        },
      })
      .then((res) => {
        const items = res.data.data ?? [];
        setSchedules(items);
        setMeta(res.data.meta ?? { current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
      })
      .catch((err) => setError(toApiError(err).message))
      .finally(() => setLoading(false));
  }, [semesterId, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    semesterService
      .list({ per_page: 100 })
      .then((res) => setSemesters(res.data))
      .catch(() => {});
  }, []);

  const semesterOptions: SelectOption<string>[] = semesters.map((s) => ({
    value: String(s.id),
    label: `Semester ${s.name}`,
  }));

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleSemesterChange = useCallback((value: string | null) => {
    setSemesterId(value);
    setPage(1);
  }, []);

  const goToPage = useCallback((target: number) => {
    setPage(target);
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return schedules;
    return schedules.filter((s) => {
      const dayLabel = DAY_LABELS[s.day] ?? s.day ?? "";
      const className = s.class?.name ?? (s.class_id != null ? `#${s.class_id}` : "");
      const subjectName = s.subject?.name ?? (s.subject_id != null ? `#${s.subject_id}` : "");
      const teacherName = s.teacher?.full_name ?? (s.teacher_id != null ? `#${s.teacher_id}` : "");
      return (
        dayLabel.toLowerCase().includes(keyword) ||
        className.toLowerCase().includes(keyword) ||
        subjectName.toLowerCase().includes(keyword) ||
        teacherName.toLowerCase().includes(keyword)
      );
    });
  }, [schedules, search]);

  const renderPeriodTime = useCallback((s: Schedule) => {
    if (s.period?.start_time) {
      return `${s.period.start_time} - ${s.period.end_time ?? ""}`;
    }
    return s.period?.name ?? "-";
  }, []);

  const renderClassName = useCallback(
    (s: Schedule) => s.class?.name ?? (s.class_id != null ? `#${s.class_id}` : "—"),
    [],
  );
  const renderSubjectName = useCallback(
    (s: Schedule) => s.subject?.name ?? (s.subject_id != null ? `#${s.subject_id}` : "—"),
    [],
  );
  const renderTeacherName = useCallback(
    (s: Schedule) => s.teacher?.full_name ?? (s.teacher_id != null ? `#${s.teacher_id}` : "—"),
    [],
  );

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

  if (schedules.length === 0 && filtered.length === 0) {
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
            <Search value={search} onChange={handleSearchChange} placeholder="Cari hari, kelas, mapel, atau guru..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Semester</span>
              <AppSelect options={semesterOptions} value={semesterId} onChange={handleSemesterChange} placeholder="Pilih Semester" isSearchable={false} isClearable className="min-w-[180px]" />
            </label>
          </div>
        </div>

        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "day" as keyof Schedule, header: "Hari", render: (_val, s) => DAY_LABELS[s.day] ?? s.day ?? "—" },
              { accessor: "period_id" as keyof Schedule, header: "Jam", render: (_val, s) => renderPeriodTime(s) },
              { accessor: "class_id" as keyof Schedule, header: "Kelas", render: (_val, s) => renderClassName(s) },
              { accessor: "subject_id" as keyof Schedule, header: "Mata Pelajaran", render: (_val, s) => renderSubjectName(s) },
              { accessor: "teacher_id" as keyof Schedule, header: "Guru", render: (_val, s) => renderTeacherName(s) },
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
                <p className="font-semibold text-primary">{DAY_LABELS[s.day] ?? s.day ?? "—"} - {renderPeriodTime(s)}</p>
                <p className="text-sm text-secondary">Kelas: {renderClassName(s)}</p>
                <p className="text-sm text-secondary">Mapel: {renderSubjectName(s)}</p>
                <p className="text-sm text-secondary">Guru: {renderTeacherName(s)}</p>
                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => openDelete(s)}><Trash2 className="h-4 w-4 mr-1 text-error" />Hapus</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {schedules.length > 0 && filtered.length === 0 && (
          <PortalEmptyState icon={<CalendarClock />} description="Tidak ada jadwal yang sesuai dengan pencarian." />
        )}

        <Pagination meta={meta} onPageChange={goToPage} loading={loading} className="px-1 pb-1" />
      </Card>

      <TeacherScheduleForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} initialData={selected} />
      <TeacherScheduleDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onDeleted={() => { setDeleteOpen(false); load(); }} data={selected} />
    </PageContainer>
  );
}