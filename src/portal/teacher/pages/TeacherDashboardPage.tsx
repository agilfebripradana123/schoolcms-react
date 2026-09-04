import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, School, ClipboardList, BookOpen, Calendar, Bell } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import Card, { CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PortalStatCard from "@/portal/components/PortalStatCard";
import TeacherNotificationsWidget from "@/portal/components/TeacherNotificationsWidget";
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
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description={`Selamat datang, ${displayName}. Ringkasan aktivitas mengajar Anda.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <PortalStatCard
          icon={<School className="h-5 w-5 text-indigo-500" />}
          label="Kelas yang diajar"
          value={classCount ?? 0}
          loading={loading}
        />
        <PortalStatCard
          icon={<CalendarClock className="h-5 w-5 text-indigo-500" />}
          label="Jadwal hari ini"
          value={todaySchedules.length}
          loading={loading}
        />
        <PortalStatCard
          icon={<ClipboardList className="h-5 w-5 text-indigo-500" />}
          label="Tugas aktif"
          value={assignments.length}
          loading={loading}
        />
        <PortalStatCard
          icon={<BookOpen className="h-5 w-5 text-indigo-500" />}
          label="Ujian"
          value={exams.length}
          loading={loading}
        />
      </div>

      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-700">Notifikasi</h2>
          </div>
          <TeacherNotificationsWidget />
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="h-5 w-5 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-700">Jadwal Hari Ini</h2>
            <span className="text-xs text-slate-500">{todayDay ? SCHEDULE_DAY_LABELS[todayDay] : "Hari ini"}</span>
          </div>
          {loading ? (
            <p className="py-6 text-center text-sm text-slate-500">Memuat...</p>
          ) : todaySchedules.length === 0 ? (
            <div className="p-6 text-center">
              <Calendar className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-500">Tidak ada jadwal hari ini</p>
              <p className="mt-1 text-xs text-slate-400">Anda tidak memiliki jadwal mengajar hari ini.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {todaySchedules.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex w-24 shrink-0 flex-col">
                    <span className="text-sm font-semibold text-slate-900">{formatTime(s.period?.start_time)}</span>
                    <span className="text-xs text-slate-500">{formatTime(s.period?.end_time)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{s.subject?.name ?? "—"}</p>
                    <p className="text-xs text-slate-500">Kelas {s.class?.name ?? "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-700">Tugas Terbaru</h2>
          </div>
          {loading ? (
            <p className="py-6 text-center text-sm text-slate-500">Memuat...</p>
          ) : assignments.length === 0 ? (
            <div className="p-6 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-400">Belum ada tugas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((a) => (
                <Card key={a.id} className="bg-slate-50">
                  <CardBody>
                    <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {a.subject?.name ?? "—"} · {a.class?.name ?? "—"}
                      {a.due_date ? ` · Deadline: ${a.due_date}` : ""}
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-700">Ujian Terbaru</h2>
          </div>
          {loading ? (
            <p className="py-6 text-center text-sm text-slate-500">Memuat...</p>
          ) : exams.length === 0 ? (
            <div className="p-6 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-400">Belum ada ujian.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exams.map((e) => (
                <Card key={e.id} className="bg-slate-50">
                  <CardBody>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                        <p className="text-xs text-slate-500">{e.subject?.name ?? "—"} · {e.duration_minutes} menit</p>
                      </div>
                      <Badge variant={statusVariants[e.status] ?? "neutral"}>{statusLabels[e.status] ?? e.status}</Badge>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center gap-2 mb-4">
            <School className="h-5 w-5 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-700">Kelas Saya</h2>
          </div>
          <p className="text-sm text-slate-500 mb-3">Kelas yang Anda ajar</p>
          <Button variant="secondary" size="sm" onClick={loadAll} disabled={loading}>
            {loading ? "Memuat..." : "Lihat Semua Kelas"}
          </Button>
        </CardBody>
      </Card>
    </PageContainer>
  );
}
