import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, GraduationCap, School, Wallet, TrendingUp, CalendarDays, Megaphone, Package, ClipboardCheck, Loader2 } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import { reportService } from "@/features/reports/api/report.service";
import { formatCurrency } from "@/lib/utils";
import { toApiError } from "@/lib/api";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

export default function Dashboard() {
  const [student, setStudent] = useState<{ total_students: number; total_classes: number } | null>(null);
  const [teacher, setTeacher] = useState<{ total_teachers: number; active_teachers: number } | null>(null);
  const [finance, setFinance] = useState<{ total_billed: number; total_paid: number; total_outstanding: number } | null>(null);
  const [attendance, setAttendance] = useState<{ hadir: number; sakit: number; izin: number; alfa: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sRes, tRes, fRes, aRes] = await Promise.allSettled([
        reportService.studentSummary(),
        reportService.teacherSummary(),
        reportService.financeSummary(),
        reportService.attendanceDaily({ date: new Date().toISOString().slice(0, 10) }),
      ]);
      if (sRes.status === "fulfilled") setStudent(sRes.value.data.totals);
      if (tRes.status === "fulfilled") setTeacher({ total_teachers: tRes.value.data.total_teachers, active_teachers: tRes.value.data.active_teachers });
      if (fRes.status === "fulfilled") setFinance(fRes.value.data.totals);
      if (aRes.status === "fulfilled") setAttendance(aRes.value.data.totals);
      if ([sRes, tRes, fRes].every((r) => r.status === "rejected")) throw new Error("Gagal memuat ringkasan");
    } catch (err) {
      const msg = toApiError(err as unknown).message;
      setError(msg);
      toast.error("Gagal memuat dasbor", { description: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Dasbor" description="Memuat data realtime..." />
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Dasbor" description="Ringkasan realtime aktivitas sekolah" />
        <Card>
          <div className="flex flex-col items-center gap-3 py-10">
            <p className="text-sm text-error">{error}</p>
            <Button variant="secondary" onClick={load}>Muat ulang</Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  const stats = [
    { label: "Jumlah Siswa", value: String(student?.total_students ?? "-"), icon: Users, to: "/admin/students" },
    { label: "Jumlah Guru", value: String(teacher?.total_teachers ?? "-"), sub: `${teacher?.active_teachers ?? 0} aktif`, icon: GraduationCap, to: "/admin/teachers" },
    { label: "Kelas Aktif", value: String(student?.total_classes ?? "-"), icon: School, to: "/admin/academic/classes" },
    { label: "Total Ditagih", value: finance ? formatCurrency(finance.total_billed) : "-", sub: finance ? `Dibayar ${formatCurrency(finance.total_paid)}` : undefined, icon: Wallet, to: "/admin/finance/billing" },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Dasbor"
        description={`Data realtime per ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} — sumber: laporan database.`}
        actions={<Button variant="secondary" size="sm" onClick={load}>Segarkan</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            className="rounded-3xl border border-slate-200 bg-surface-container-lowest p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
          >
            <div className="flex items-center gap-2 text-on-surface-variant">
              <stat.icon className="h-4 w-4" />
              <p className="text-sm font-medium">{stat.label}</p>
            </div>
            <p className="mt-3 font-display text-3xl font-bold tracking-tight text-on-surface">{stat.value}</p>
            {stat.sub && <p className="mt-2 text-xs font-medium text-on-surface-variant">{stat.sub}</p>}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="font-display text-base font-semibold text-on-surface">Keuangan</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-on-surface-variant">Ditagih</dt><dd className="font-semibold text-on-surface">{finance ? formatCurrency(finance.total_billed) : "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-on-surface-variant">Dibayar</dt><dd className="font-semibold text-tertiary">{finance ? formatCurrency(finance.total_paid) : "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-on-surface-variant">Belum dibayar</dt><dd className="font-semibold text-error">{finance ? formatCurrency(finance.total_outstanding) : "-"}</dd></div>
          </dl>
          <Link to="/admin/reports/finance" className="mt-4 inline-block text-xs font-semibold text-primary-container hover:underline">Lihat laporan keuangan →</Link>
        </Card>

        <Card>
          <h3 className="font-display text-base font-semibold text-on-surface">Kehadiran Hari Ini</h3>
          {attendance ? (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-surface-container-low p-3"><p className="text-on-surface-variant">Hadir</p><p className="mt-1 text-lg font-bold text-on-surface">{attendance.hadir}</p></div>
              <div className="rounded-2xl bg-surface-container-low p-3"><p className="text-on-surface-variant">Sakit</p><p className="mt-1 text-lg font-bold text-on-surface">{attendance.sakit}</p></div>
              <div className="rounded-2xl bg-surface-container-low p-3"><p className="text-on-surface-variant">Izin</p><p className="mt-1 text-lg font-bold text-on-surface">{attendance.izin}</p></div>
              <div className="rounded-2xl bg-surface-container-low p-3"><p className="text-on-surface-variant">Alfa</p><p className="mt-1 text-lg font-bold text-error">{attendance.alfa}</p></div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-on-surface-variant">Belum ada data hari ini.</p>
          )}
          <Link to="/admin/reports/attendance" className="mt-4 inline-block text-xs font-semibold text-primary-container hover:underline">Lihat laporan kehadiran →</Link>
        </Card>

        <Card>
          <h3 className="font-display text-base font-semibold text-on-surface">Aksi Cepat</h3>
          <div className="mt-4 grid gap-3">
            {[
              { label: "Tambah siswa", to: "/admin/students", icon: Users },
              { label: "Buat pengumuman", to: "/admin/communication/announcements", icon: Megaphone },
              { label: "Generate rapor", to: "/admin/academic/report-cards", icon: ClipboardCheck },
              { label: "Kelola keuangan", to: "/admin/finance/billing", icon: Wallet },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-on-surface shadow-sm transition-colors hover:border-primary-container hover:text-primary-container"
              >
                <action.icon className="h-4 w-4" /> {action.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-display flex items-center gap-2 text-base font-semibold text-on-surface"><CalendarDays className="h-4 w-4" /> Kalender & Pengumuman</h3>
          <p className="mt-2 text-sm text-on-surface-variant">Data kalender dan pengumuman terbaru dari database. Buka modul komunikasi untuk detail.</p>
          <div className="mt-4 flex gap-2">
            <Link to="/admin/communication/calendar" className="text-xs font-semibold text-primary-container hover:underline">Kalender</Link>
            <span className="text-slate-300">·</span>
            <Link to="/admin/communication/announcements" className="text-xs font-semibold text-primary-container hover:underline">Pengumuman</Link>
          </div>
        </Card>
        <Card>
          <h3 className="font-display flex items-center gap-2 text-base font-semibold text-on-surface"><Package className="h-4 w-4" /> Inventaris</h3>
          <p className="mt-2 text-sm text-on-surface-variant">Stok rendah dan pergerakan inventaris realtime.</p>
          <Link to="/admin/reports/inventory" className="mt-4 inline-block text-xs font-semibold text-primary-container hover:underline">Lihat laporan inventaris →</Link>
        </Card>
      </div>
    </PageContainer>
  );
}
