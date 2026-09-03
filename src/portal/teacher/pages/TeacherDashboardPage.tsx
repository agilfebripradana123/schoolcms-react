import { CalendarClock, School, ClipboardList, BookOpen } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import TeacherSectionCard from "@/portal/teacher/components/TeacherSectionCard";
import TeacherNotificationsWidget from "@/portal/teacher/components/TeacherNotificationsWidget";
import TeacherEmptyData from "@/portal/teacher/components/TeacherEmptyData";

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.name || "Guru";
  const role = user?.role ? String(user.role) : "";
  const isGuru = role.toLowerCase() === "guru";

  return (
    <div className="space-y-6">
      {/* A. Welcome / Identity (dari auth context, tanpa request baru) */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
            <span className="text-xl font-bold">{displayName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-on-surface">
              Selamat datang, {displayName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="primary">Portal Guru</Badge>
              {isGuru && <Badge variant="secondary">Guru</Badge>}
              {user?.email && (
                <p className="text-sm text-on-surface-variant">{user.email}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* G. Notifications (GET /api/notifications/my — identity-derived, aman untuk Guru) */}
      <TeacherSectionCard
        title="Notifikasi"
        description="Pemberitahuan terbaru untuk Anda"
        to="/guru/notifications"
      >
        <TeacherNotificationsWidget />
      </TeacherSectionCard>

      {/* B. Summary cards placeholder — menunggu teacher-scoped API */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <School className="h-6 w-6 text-primary" />
          <p className="mt-3 text-sm font-semibold text-on-surface">Kelas yang diajar</p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Menunggu API self-service guru.
          </p>
        </Card>
        <Card>
          <CalendarClock className="h-6 w-6 text-primary" />
          <p className="mt-3 text-sm font-semibold text-on-surface">Jadwal hari ini</p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Menunggu API self-service guru.
          </p>
        </Card>
        <Card>
          <ClipboardList className="h-6 w-6 text-primary" />
          <p className="mt-3 text-sm font-semibold text-on-surface">Tugas</p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Menunggu API self-service guru.
          </p>
        </Card>
        <Card>
          <BookOpen className="h-6 w-6 text-primary" />
          <p className="mt-3 text-sm font-semibold text-on-surface">Ujian</p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Menunggu API self-service guru.
          </p>
        </Card>
      </div>

      {/* C. Jadwal Mengajar — belum ada endpoint yang menjamin scope guru */}
      <TeacherSectionCard
        title="Jadwal Mengajar"
        description="Jadwal terdekat Anda"
        to="/guru/academic/schedule"
      >
        <TeacherEmptyData
          title="Jadwal belum tersedia"
          description="Endpoint jadwal ter-scope guru (self-service) belum tersedia. Jadwal hanya dapat diambil per teacher_id oleh Admin, bukan dari identitas login Guru."
        />
      </TeacherSectionCard>

      {/* D. Kelas Saya — menunggu teacher-scoped API */}
      <TeacherSectionCard
        title="Kelas Saya"
        description="Ringkasan kelas yang Anda ajar"
        to="/guru/academic/classes"
      >
        <TeacherEmptyData
          title="Kelas belum tersedia"
          description="Belum ada endpoint kelas ter-scope guru. Menampilkan seluruh kelas sekolah kepada Guru bukanlah scope yang aman."
        />
      </TeacherSectionCard>

      {/* E. Tugas — menunggu teacher-scoped API */}
      <TeacherSectionCard
        title="Tugas"
        description="Ringkasan tugas yang perlu diperhatikan"
        to="/guru/academic/assignments"
      >
        <TeacherEmptyData
          title="Tugas belum tersedia"
          description="Endpoint tugas ter-scope guru (self-service) belum tersedia."
        />
      </TeacherSectionCard>

      {/* F. Ujian — menunggu teacher-scoped API */}
      <TeacherSectionCard title="Ujian" description="Ujian terdekat" to="/guru/examinations">
        <TeacherEmptyData
          title="Ujian belum tersedia"
          description="Endpoint ujian ter-scope guru (self-service) belum tersedia."
        />
      </TeacherSectionCard>
    </div>
  );
}
