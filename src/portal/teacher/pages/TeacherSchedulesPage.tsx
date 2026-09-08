import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Clock } from "lucide-react";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card, { CardBody } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import PortalFilterBar from "@/portal/components/PortalFilterBar";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import {
  teacherScheduleService,
  academicYearService,
  semesterService,
} from "@/features/academic";
import {
  SCHEDULE_DAY_LABELS,
  SCHEDULE_DAYS,
  type ScheduleDay,
  type TeacherSchedule,
} from "@/features/academic/api/types";
import type { AcademicYear, Semester } from "@/features/academic/api/types";
import type { SelectOption } from "@/components/ui/Select";
import { toApiError } from "@/lib/api";

export default function TeacherSchedulesPage() {
  const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [day, setDay] = useState<ScheduleDay | null>(null);
  const [academicYearId, setAcademicYearId] = useState<number | null>(null);
  const [semesterId, setSemesterId] = useState<number | null>(null);

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [yearsLoading, setYearsLoading] = useState(true);
  const [semestersLoading, setSemestersLoading] = useState(false);

  const loadSchedules = useCallback(
    (filters: { day?: ScheduleDay | null; academicYearId?: number | null; semesterId?: number | null }) => {
      setLoading(true);
      setError(null);
      teacherScheduleService
        .list({
          day: filters.day ?? undefined,
          academic_year_id: filters.academicYearId ?? undefined,
          semester_id: filters.semesterId ?? undefined,
        })
        .then((res) => setSchedules(res.data ?? []))
        .catch((err) => setError(toApiError(err).message))
        .finally(() => setLoading(false));
    },
    [],
  );

  useEffect(() => {
    loadSchedules({ day, academicYearId, semesterId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setYearsLoading(true);
    academicYearService
      .list({ is_active: true, per_page: 100 })
      .then((res) => setYears(res.data ?? []))
      .catch(() => setYears([]))
      .finally(() => setYearsLoading(false));
  }, []);

  useEffect(() => {
    setSemestersLoading(true);
    setSemesterId(null);
    semesterService
      .list(academicYearId ? { academic_year_id: academicYearId, per_page: 100 } : { per_page: 100 })
      .then((res) => setSemesters(res.data ?? []))
      .catch(() => setSemesters([]))
      .finally(() => setSemestersLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academicYearId]);

  const yearOptions = useMemo<SelectOption<number>[]>(
    () => years.map((y) => ({ value: y.id, label: y.name })),
    [years],
  );

  const semesterOptions = useMemo<SelectOption<number>[]>(
    () => semesters.map((s) => ({ value: s.id, label: s.name })),
    [semesters],
  );

  const dayOptions = useMemo<SelectOption<string>[]>(
    () => SCHEDULE_DAYS.map((d) => ({ value: d, label: SCHEDULE_DAY_LABELS[d] })),
    [],
  );

  const applyFilters = () => {
    loadSchedules({ day, academicYearId, semesterId });
  };

  const grouped = useMemo(() => {
    const groups: Record<string, TeacherSchedule[]> = {};
    for (const d of SCHEDULE_DAYS) groups[d] = [];
    for (const s of schedules) {
      const group = groups[s.day];
      if (group) group.push(s);
    }
    return groups;
  }, [schedules]);

  const formatTime = (t?: string | null) => t ?? "—";

  return (
    <PageContainer>
      <PageHeader
        title="Jadwal Mengajar"
        description="Jadwal mengajar Anda, scoped dari identitas login."
      />

      <PortalFilterBar className="mb-6">
          <Calendar className="h-4 w-4 text-slate-500" />
          <label className="text-sm font-medium text-slate-700">Hari:</label>
          <div className="min-w-[200px]">
            <Select<string>
              options={dayOptions}
              value={day ? String(day) : null}
              onChange={(v) => setDay((v as ScheduleDay) ?? null)}
              placeholder="Semua hari"
              isClearable
            />
          </div>
          <label className="text-sm font-medium text-slate-700">Tahun:</label>
          <div className="min-w-[180px]">
            <Select<number>
              options={yearOptions}
              value={academicYearId}
              onChange={setAcademicYearId}
              placeholder="Semua tahun"
              isClearable
              isLoading={yearsLoading}
            />
          </div>
          <label className="text-sm font-medium text-slate-700">Semester:</label>
          <div className="min-w-[180px]">
            <Select<number>
              options={semesterOptions}
              value={semesterId}
              onChange={setSemesterId}
              placeholder="Semua semester"
              isClearable
              isLoading={semestersLoading}
            />
          </div>
          <Button type="button" onClick={applyFilters} disabled={loading}>
            Tampilkan
          </Button>
      </PortalFilterBar>

      {error ? (
        <PortalErrorState message={error} />
      ) : loading ? (
        <PortalLoadingState />
      ) : schedules.length === 0 ? (
        <PortalEmptyState icon={<Calendar className="h-10 w-10" />} description="Belum ada jadwal mengajar untuk filter yang dipilih." />
      ) : (
        <div className="space-y-6">
          {SCHEDULE_DAYS.map((d) => {
            const items = grouped[d];
            if (!items || items.length === 0) return null;
            return (
              <Card key={d}>
                <CardBody>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-indigo-500" />
                    <h2 className="text-sm font-semibold text-slate-700">{SCHEDULE_DAY_LABELS[d]}</h2>
                  </div>
                  <div className="space-y-3">
                    {items.map((s) => (
                      <Card key={s.id} className="bg-slate-50">
                        <CardBody>
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex w-28 shrink-0 flex-col">
                              <span className="text-sm font-semibold text-slate-900">{formatTime(s.period?.start_time)}</span>
                              <span className="text-xs text-slate-500">{formatTime(s.period?.end_time)}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900">{s.subject?.name ?? "—"}</p>
                              <p className="text-xs text-slate-500">Kelas {s.class?.name ?? "—"}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {s.academic_year?.name && <Badge variant="neutral">{s.academic_year.name}</Badge>}
                              {s.semester?.name && <Badge variant="neutral">{s.semester.name}</Badge>}
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
