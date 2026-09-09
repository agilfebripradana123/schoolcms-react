import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  Calendar,
  Bell,
  CheckCircle,
  AlertTriangle,
  FileText,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { STUDENTS, COMMUNICATION } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";
import { formatDate } from "@/lib/format";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface StudentProfile {
  id: number;
  name: string;
  nis?: string;
  nisn?: string;
  class_id?: number;
  class_name?: string;
  email?: string;
  photo?: string | null;
  parent?: Record<string, unknown> | null;
  [key: string]: unknown;
}

interface GradeSummary {
  average: number;
  highest: number;
  total_subjects: number;
}

interface AttendanceSummary {
  total_days: number;
  present: number;
  sick: number;
  permission: number;
  absent: number;
  percentage: number;
}

interface ScheduleItem {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  subject_name: string;
  teacher_name: string | null;
  room_name: string | null;
}

interface AssignmentItem {
  id: number;
  title: string;
  description?: string | null;
  subject_id: number;
  class_id: number;
  teacher_id?: number | null;
  due_date?: string | null;
  subject?: { name: string } | null;
  created_at?: string | null;
}

interface ExamItem {
  id: number;
  title: string;
  description?: string | null;
  subject?: { name: string } | null;
  class_id: number;
  exam_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status?: string | null;
}

interface NotificationItem {
  id: number;
  title: string;
  message?: string | null;
  type?: string | null;
  is_read: boolean;
  created_at: string;
}

interface ViolationItem {
  id: number;
  category: string;
  description: string;
  points: number;
  violated_at: string | null;
}

const TRACKED_KEYS = [
  "name","nis","nisn","nik","gender","religion","birth_place","birth_date",
  "address","rt","rw","hamlet","village","district","postal_code","residence_type","transportation",
  "class_name","previous_school","skhun","national_exam_number","diploma_serial_number","birth_order","sibling_count",
  "weight","height","head_circumference","school_distance","latitude","longitude",
  "family_card_number","birth_certificate_registration_number","telephone",
  "bank_name","bank_account_number","bank_account_holder",
  "phone","email",
];

const PARENT_KEYS = [
  "father_name","mother_name","father_occupation","mother_occupation","phone","address",
];

function isEmpty(v: unknown) {
  return v == null || v === "";
}

export default function StudentPortalPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [gradeSummary, setGradeSummary] = useState<GradeSummary | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<AssignmentItem[]>([]);
  const [recentExams, setRecentExams] = useState<ExamItem[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [recentViolations, setRecentViolations] = useState<ViolationItem[]>([]);

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [akademikLoading, setAkademikLoading] = useState(true);
  const [akademikError, setAkademikError] = useState<string | null>(null);
  const [aktivitasLoading, setAktivitasLoading] = useState(true);
  const [aktivitasError, setAktivitasError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const res = await api.get<{ success: boolean; data: StudentProfile }>(
          STUDENTS.PROFILE,
        );
        if (active) setProfile(res.data);
      } catch (err) {
        if (active) setProfileError(toApiError(err).message);
      } finally {
        if (active) setProfileLoading(false);
      }
    }

    async function loadAkademik() {
      try {
        const [gradesRes, attendanceRes, schedulesRes] = await Promise.all([
          api.get<{ success: boolean; data: GradeSummary }>(`${STUDENTS.GRADES}/summary`),
          api.get<{ success: boolean; data: AttendanceSummary }>(`${STUDENTS.ATTENDANCE}/summary`),
          api.get<{ success: boolean; data: ScheduleItem[] }>(STUDENTS.SCHEDULES),
        ]);
        if (!active) return;
        setGradeSummary(gradesRes.data);
        setAttendanceSummary(attendanceRes.data);
        const today = new Date().toLocaleDateString("id-ID", { weekday: "long" }).toLowerCase();
        setTodaySchedule(schedulesRes.data.filter((s) => s.day.toLowerCase() === today));
      } catch (err) {
        if (active) setAkademikError(toApiError(err).message);
      } finally {
        if (active) setAkademikLoading(false);
      }
    }

    async function loadAktivitas() {
      try {
        const [assignmentsRes, examsRes, notificationsRes, violationsRes] = await Promise.all([
          api.get<{ success: boolean; data: AssignmentItem[] }>(STUDENTS.ASSIGNMENTS),
          api.get<{ success: boolean; data: ExamItem[] }>(STUDENTS.EXAMS),
          api.get<{ success: boolean; data: NotificationItem[] }>(COMMUNICATION.NOTIFICATIONS_MY),
          api.get<{ success: boolean; data: ViolationItem[] }>(STUDENTS.VIOLATIONS),
        ]);
        if (!active) return;
        const sortedAssignments = [...assignmentsRes.data]
          .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
          .slice(0, 5);
        const sortedExams = [...examsRes.data]
          .sort((a, b) => new Date(b.exam_date || 0).getTime() - new Date(a.exam_date || 0).getTime())
          .slice(0, 5);
        const sortedNotifications = [...notificationsRes.data]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        const sortedViolations = [...violationsRes.data]
          .sort((a, b) => new Date(b.violated_at || 0).getTime() - new Date(a.violated_at || 0).getTime())
          .slice(0, 3);
        setRecentAssignments(sortedAssignments);
        setRecentExams(sortedExams);
        setRecentNotifications(sortedNotifications);
        setRecentViolations(sortedViolations);
      } catch (err) {
        if (active) setAktivitasError(toApiError(err).message);
      } finally {
        if (active) setAktivitasLoading(false);
      }
    }

    loadProfile();
    loadAkademik();
    loadAktivitas();

    return () => { active = false; };
  }, []);

  const completeness = useMemo(() => {
    if (!profile) return { total: 0, filled: 0, pct: 0, missing: 0 };
    let total = TRACKED_KEYS.length;
    let filled = 0;
    for (const key of TRACKED_KEYS) {
      if (!isEmpty(profile[key])) filled++;
    }
    const parent = profile.parent as Record<string, unknown> | null | undefined;
    total += PARENT_KEYS.length;
    for (const key of PARENT_KEYS) {
      if (parent && !isEmpty(parent[key])) filled++;
    }
    return { total, filled, pct: total ? Math.round((filled / total) * 100) : 0, missing: total - filled };
  }, [profile]);

  const isLoading = profileLoading || akademikLoading || aktivitasLoading;
  const globalError = profileError || akademikError || aktivitasError;

  if (isLoading && !globalError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (globalError && !profile && !gradeSummary && !recentAssignments.length) {
    return (
      <Card className="border-error/20 bg-error-container/15">
        <CardBody>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <p className="text-sm text-red-700">Gagal memuat data: {globalError}</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Hero Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {profile?.photo ? (
              <img src={profile.photo} alt={profile.name} className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm" onError={(e)=>{ (e.target as HTMLImageElement).style.display='none'; }} />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
                <span className="text-2xl font-bold">
                  {profile?.name?.charAt(0).toUpperCase() || "S"}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold leading-tight text-primary sm:text-2xl">
                Selamat datang, {profile?.name || "Siswa"}
              </h1>
              <p className="mt-1 text-sm text-secondary">
                {profile?.nisn ? `NISN: ${profile.nisn}` : ""}
                {profile?.nis && profile.nisn ? " · " : ""}
                {profile?.nis ? `NIS: ${profile.nis}` : ""}
                {profile?.class_name ? ` · Kelas ${profile.class_name}` : ""}
              </p>
            </div>
          </div>
          <Link
            to="/siswa/profile"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 shadow-sm"
          >
            <CheckCircle className="h-4 w-4" />
            Lihat Profil
          </Link>
        </div>
      </Card>

      {/* Akademik Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-primary">Akademik</h2>
           <Link to="/siswa/grades" className="text-sm text-primary hover:underline">
             <ArrowRight className="h-4 w-4" />
           </Link>
        </div>

        {akademikLoading && !akademikError ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-dashed">
                <CardBody className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader title="Rata-rata Nilai" />
              <CardBody className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {gradeSummary?.average?.toFixed(1) ?? "-"}
                </p>
                <p className="mt-1 text-xs text-secondary">
                  dari {gradeSummary?.total_subjects ?? 0} mata pelajaran
                </p>
              </CardBody>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardHeader title="Kehadiran" />
              <CardBody className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {attendanceSummary?.percentage?.toFixed(0) ?? "-"}%
                </p>
                <p className="mt-1 text-xs text-secondary">
                  {attendanceSummary?.present ?? 0} dari {attendanceSummary?.total_days ?? 0} hari hadir
                </p>
              </CardBody>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardHeader title="Jadwal Hari Ini" />
              <CardBody>
                {todaySchedule.length === 0 ? (
                  <p className="text-center text-sm text-secondary py-4">Tidak ada jadwal hari ini</p>
                ) : (
                  <div className="space-y-2">
                    {todaySchedule.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary">{s.subject_name}</Badge>
                        <span className="text-secondary">
                          {s.start_time} - {s.end_time}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {akademikError && (
          <Card className="border-error/20 bg-error-container/15">
            <CardBody>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-700">{akademikError}</p>
              </div>
            </CardBody>
          </Card>
        )}
      </section>

      {/* Aktivitas Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-primary">Aktivitas</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Tugas Terbaru */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader title="Tugas Terbaru" />
            <CardBody className="space-y-3">
              {aktivitasLoading && !aktivitasError ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : recentAssignments.length === 0 ? (
                <p className="text-center text-sm text-secondary py-4">Belum ada tugas</p>
              ) : (
                recentAssignments.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-container">
                    <div className="flex-shrink-0 mt-0.5">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-primary">{a.title}</p>
                      <p className="text-xs text-secondary">
                        {a.subject?.name ?? `Mata pelajaran #${a.subject_id}`}
                        {a.due_date ? ` · Jatuh tempo ${formatDate(a.due_date)}` : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div className="pt-2">
                <Link to="/siswa/assignments" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Lihat semua tugas <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Ujian Terbaru */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader title="Ujian Terbaru" />
            <CardBody className="space-y-3">
              {aktivitasLoading && !aktivitasError ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : recentExams.length === 0 ? (
                <p className="text-center text-sm text-secondary py-4">Belum ada ujian</p>
              ) : (
                recentExams.map((e) => (
                  <div key={e.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-container">
                    <div className="flex-shrink-0 mt-0.5">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-primary">{e.title}</p>
                      <p className="text-xs text-secondary">
                        {e.subject?.name ?? ""}
                        {e.exam_date ? ` · ${formatDate(e.exam_date)}` : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div className="pt-2">
                 <Link to="/siswa/exams" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                   Lihat semua ujian <ArrowRight className="h-3.5 w-3.5" />
                 </Link>
              </div>
            </CardBody>
          </Card>

          {/* Notifikasi Terbaru */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader title="Notifikasi Terbaru" />
            <CardBody className="space-y-3">
              {aktivitasLoading && !aktivitasError ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : recentNotifications.length === 0 ? (
                <p className="text-center text-sm text-secondary py-4">Belum ada notifikasi</p>
              ) : (
                recentNotifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-container">
                    <div className="flex-shrink-0 mt-0.5">
                      <Bell className={`h-4 w-4 ${n.is_read ? "text-secondary" : "text-primary"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${n.is_read ? "font-medium" : "font-semibold"} text-primary`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-secondary">
                        {n.message ? `${n.message.slice(0, 60)}${n.message.length > 60 ? "..." : ""}` : ""}
                      </p>
                      <p className="mt-0.5 text-[11px] text-secondary">
                        {new Date(n.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
                            <div className="pt-2">
                <Link to="/siswa/notifications" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Lihat semua notifikasi <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {aktivitasError && (
          <Card className="border-error/20 bg-error-container/15">
            <CardBody>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-700">{aktivitasError}</p>
              </div>
            </CardBody>
          </Card>
        )}
      </section>

      {/* Profil Card - completeness */}
      <Link to="/siswa/profile" className="block">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader title="Profil & Kelengkapan" description="Lihat detail di /siswa/profile" />
          <CardBody>
            {completeness.missing > 0 ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-rose-600">{completeness.missing}</span>
                  <span className="text-xs text-secondary">data belum lengkap</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-low">
                  <div
                    className="h-full rounded-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${completeness.pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-secondary">{completeness.pct}% terisi</p>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-600">Profil lengkap</span>
              </div>
            )}
          </CardBody>
        </Card>
      </Link>
    </div>
  );
}
