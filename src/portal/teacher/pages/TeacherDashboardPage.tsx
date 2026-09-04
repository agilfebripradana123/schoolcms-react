import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, School, ClipboardList, BookOpen, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import TeacherSectionCard from "@/portal/teacher/components/TeacherSectionCard";
import TeacherNotificationsWidget from "@/portal/teacher/components/TeacherNotificationsWidget";
import TeacherEmptyData from "@/portal/teacher/components/TeacherEmptyData";
import { teacherClassService, teacherScheduleService, myAssignmentService } from "@/features/academic";
import { myExamService } from "@/features/examinations";
import { SCHEDULE_DAY_LABELS, type ScheduleDay, type TeacherSchedule } from "@/features/academic/api/types";
import type { Assignment } from "@/features/academic/api/types";
import type { Exam } from "@/features/examinations/api/types";

const DAY_MAP: Record<number, ScheduleDay> = {
  1: "senin",
  2: "selasa",
  3: "rabu",
  4: "kamis",
  5: "jumat",
  6: "sabtu",
};

function formatTime(t?: string | null) {
  return t ?? "—";
}

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.name || "Guru";

  const [classCount, setClassCount] = useState<number | null>(null);
  const [todaySchedules, setTodaySchedules] = useState<TeacherSchedule[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  const todayDay = useMemo(() => DAY_MAP[new Date().getDay()], []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      teacherClassService.list(),
      todayDay
        ? teacherScheduleService.list({ day: todayDay })
        : Promise.resolve({ data: [] as TeacherSchedule[] }),
      myAssignmentService.list({ per_page: 5 }),
      myExamService.list({ per_page: 5 }),
    ]);

    const [classRes, scheduleRes, assignmentRes, examRes] = results;

    if (classRes.status === "fulfilled") setClassCount(classRes.value.data?.length ?? 0);
    if (scheduleRes.status === "fulfilled") setTodaySchedules(scheduleRes.value.data ?? []);
    if (assignmentRes.status === "fulfilled") setAssignments(assignmentRes.value.data ?? []);
    if (examRes.status === "fulfilled") setExams(examRes.value.data ?? []);

    setLoading(false);
  }, [todayDay]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const statusVariants: Record<string, "success" | "warning" | "neutral" | "primary"> = {
    draft: "neutral",
    published: "primary",
    ongoing: "warning",
    completed: "success",
    archived: "neutral",
  };
  const statusLabels: Record<string, string> = {
    draft: "Draf",
    published: "Terbit",
    ongoing: "Berlangsung",
    completed: "Selesai",
    archived: "Arsip",
  };

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Dashboard"
        description={`Selamat datang, ${displayName}. Ringkasan aktivitas mengajar Anda.`}
      />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <School className="h-6 w-6 text-primary" />
          <p className="mt-3 text-sm font-semibold text-on-surface">Kelas yang diajar</p>
          <p className="mt-1 text-lg font-bold text-on-surface">
            {loading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : classCount ?? 0}
          </p>
        </Card>
        <Card>
          <CalendarClock className="h-6 w-6 text-primary" />
          <p className="mt-3 text-sm font-semibold text-on-surface">Jadwal hari ini</p>
          <p className="mt-1 text-lg font-bold text-on-surface">
            {loading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : todaySchedules.length}
          </p>
        </Card>
        <Card>
          <ClipboardList className="h-6 w-6 text-primary" />
          <p className="mt-3 text-sm font-semibold text-on-surface">Tugas aktif</p>
          <p className="mt-1 text-lg font-bold text-on-surface">
            {loading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : assignments.length}
          </p>
        </Card>
        <Card>
          <BookOpen className="h-6 w-6 text-primary" />
          <p className="mt-3 text-sm font-semibold text-on-surface">Ujian</p>
          <p className="mt-1 text-lg font-bold text-on-surface">
            {loading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : exams.length}
          </p>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Notifications */}
        <TeacherSectionCard
          title="Notifikasi"
          description="Pemberitahuan terbaru untuk Anda"
          to="/guru/notifications"
        >
          <TeacherNotificationsWidget />
        </TeacherSectionCard>

        {/* Jadwal Hari Ini */}
        <TeacherSectionCard
          title="Jadwal Hari Ini"
          description={todayDay ? SCHEDULE_DAY_LABELS[todayDay] : "Hari ini"}
          to="/guru/academic/schedules"
        >
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : todaySchedules.length === 0 ? (
            <TeacherEmptyData
              title="Tidak ada jadwal hari ini"
              description="Anda tidak memiliki jadwal mengajar hari ini."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {todaySchedules.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex w-24 shrink-0 flex-col">
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
                </div>
              ))}
            </div>
          )}
        </TeacherSectionCard>

        {/* Tugas Terbaru */}
        <TeacherSectionCard
          title="Tugas Terbaru"
          description="Tugas yang perlu diperhatikan"
          to="/guru/academic/assignments"
        >
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : assignments.length === 0 ? (
            <TeacherEmptyData
              title="Belum ada tugas"
              description="Tidak ada tugas aktif pada scope mengajar Anda."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {assignments.map((a) => (
                <div key={a.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-semibold text-on-surface">{a.title}</p>
                  <p className="text-xs text-on-surface-variant">
                    {a.subject?.name ?? "—"} · {a.class?.name ?? "—"}
                    {a.due_date ? ` · Deadline: ${a.due_date}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TeacherSectionCard>

        {/* Ujian Terbaru */}
        <TeacherSectionCard title="Ujian Terbaru" description="Ujian terdekat" to="/guru/examinations">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : exams.length === 0 ? (
            <TeacherEmptyData
              title="Belum ada ujian"
              description="Tidak ada ujian pada mata pelajaran scope mengajar Anda."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {exams.map((e) => (
                <div key={e.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-on-surface">{e.title}</p>
                    <p className="text-xs text-on-surface-variant">
                      {e.subject?.name ?? "—"} · {e.duration_minutes} menit
                    </p>
                  </div>
                  <Badge variant={statusVariants[e.status] ?? "neutral"}>
                    {statusLabels[e.status] ?? e.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </TeacherSectionCard>

        {/* Kelas Saya */}
        <TeacherSectionCard
          title="Kelas Saya"
          description="Kelas yang Anda ajar"
          to="/guru/academic/classes"
        >
          <div className="px-4 py-3">
            <Button variant="secondary" size="sm" onClick={loadAll} disabled={loading}>
              {loading ? "Memuat..." : "Lihat Semua Kelas"}
            </Button>
          </div>
        </TeacherSectionCard>
      </div>
    </PageContainer>
  );
}
