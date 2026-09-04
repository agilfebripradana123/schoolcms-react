import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
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
    <PageContainer className="py-6">
      <PageHeader
        title="Jadwal Mengajar"
        description="Jadwal mengajar Anda, scoped dari identitas login."
      />

      <Card>
        {/* Filter toolbar */}
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Hari
            </label>
            <Select<string>
              options={dayOptions}
              value={day ? String(day) : null}
              onChange={(v) => setDay((v as ScheduleDay) ?? null)}
              placeholder="Semua hari"
              isClearable
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Tahun Ajaran
            </label>
            <Select<number>
              options={yearOptions}
              value={academicYearId}
              onChange={setAcademicYearId}
              placeholder="Semua tahun"
              isClearable
              isLoading={yearsLoading}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Semester
            </label>
            <Select<number>
              options={semesterOptions}
              value={semesterId}
              onChange={setSemesterId}
              placeholder="Semua semester"
              isClearable
              isLoading={semestersLoading}
            />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={applyFilters} disabled={loading}>
              Terapkan Filter
            </Button>
          </div>
        </div>

        {/* Content states */}
        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">{error}</p>
            <Button variant="secondary" size="sm" onClick={applyFilters}>
              Muat Ulang
            </Button>
          </div>
        ) : loading ? (
          <div className="py-10 text-center text-sm text-on-surface-variant">Memuat jadwal...</div>
        ) : schedules.length === 0 ? (
          <div className="py-10 text-center">
            <CalendarClock className="mx-auto h-8 w-8 text-outline" />
            <p className="mt-2 text-sm font-semibold text-on-surface">Belum ada jadwal mengajar.</p>
            <p className="mt-1 text-xs text-on-surface-variant">
              Tidak ditemukan jadwal untuk filter yang dipilih.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {SCHEDULE_DAYS.map((d) => {
              const items = grouped[d];
              if (!items || items.length === 0) return null;
              return (
                <Card key={d}>
                  <CardHeader title={SCHEDULE_DAY_LABELS[d]} />
                  <CardBody className="divide-y divide-slate-100">
                    {items.map((s) => (
                      <div key={s.id} className="flex flex-wrap items-center gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="flex w-28 shrink-0 flex-col">
                          <span className="text-sm font-semibold text-on-surface">
                            {formatTime(s.period?.start_time)}
                          </span>
                          <span className="text-xs text-on-surface-variant">
                            {formatTime(s.period?.end_time)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-on-surface">
                            {s.subject?.name ?? "—"}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            Kelas {s.class?.name ?? "—"}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                          {s.academic_year?.name && (
                            <span className="rounded-full bg-surface-container-high px-2 py-0.5">
                              {s.academic_year.name}
                            </span>
                          )}
                          {s.semester?.name && (
                            <span className="rounded-full bg-surface-container-high px-2 py-0.5">
                              {s.semester.name}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
