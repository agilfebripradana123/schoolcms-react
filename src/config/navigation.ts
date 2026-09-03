import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCog,
  UserPlus,
  DollarSign,
  Building2,
  FileText,
  ClipboardList,
  BarChart3,
  BookOpen,
  CalendarDays,
  Library,
  School,
  ClipboardCheck,
  Award,
  BadgePercent,
  ArrowLeftRight,
  GraduationCapIcon,
  CreditCard,
  Receipt,
  Wallet,
  PiggyBank,
  TrendingUp,
  BedDouble,
  Wrench,
  Package,
  Mail,
  Send,
  FileStack,
  FolderOpen,
  Megaphone,
  Bell,
  CalendarClock,
  BrainCircuit,
  Trophy,
  ShieldAlert,
  Activity,
  Shield,
  KeyRound,
  ScrollText,
  Cog,
  Stethoscope,
  Dumbbell,
  Clock,
  ShieldCheck,
  User,
} from "lucide-react";
import type { NavigationGroup } from "@/types";

export const navigation: NavigationGroup[] = [
  {
    label: "Akademik",
    items: [
      { label: "Tahun Ajaran", path: "/admin/academic/years", icon: CalendarDays },
      { label: "Semester", path: "/admin/academic/semesters", icon: CalendarDays },
      { label: "Kurikulum", path: "/admin/academic/curriculum", icon: BookOpen },
      { label: "Mata Pelajaran", path: "/admin/academic/subjects", icon: Library },
      { label: "Kelas", path: "/admin/academic/classes", icon: School },
      { label: "Mata Pelajaran Kelas", path: "/admin/academic/class-subjects", icon: BookOpen },
      { label: "Siswa Kelas", path: "/admin/academic/class-students", icon: Users },
      { label: "Jadwal", path: "/admin/academic/schedules", icon: CalendarClock },
      { label: "Jam Pelajaran", path: "/admin/academic/periods", icon: Clock },
      { label: "Tugas", path: "/admin/academic/assignments", icon: ClipboardList },
      { label: "Nilai", path: "/admin/academic/grades", icon: Award },
      { label: "Rapor", path: "/admin/academic/report-cards", icon: GraduationCap },
    ],
  },
  {
    label: "Siswa",
    items: [
      { label: "Data Siswa", path: "/admin/students", icon: Users },
      { label: "Riwayat Siswa", path: "/admin/students/history", icon: ScrollText },
      { label: "Kehadiran", path: "/admin/students/attendance", icon: ClipboardCheck },
      { label: "Mutasi Siswa", path: "/admin/students/transfers", icon: ArrowLeftRight },
      { label: "Alumni", path: "/admin/students/alumni", icon: GraduationCapIcon },
      { label: "Kartu Pelajar", path: "/admin/students/id-card", icon: BadgePercent },
    ],
  },
  {
    label: "Guru & Staf",
    items: [
      { label: "Guru", path: "/admin/teachers", icon: UserCog },
      { label: "Staf", path: "/admin/teachers/staff", icon: Users },
      { label: "Penugasan Mengajar", path: "/admin/teachers/assignments", icon: ClipboardList },
      { label: "Kehadiran Guru", path: "/admin/teachers/attendance", icon: ClipboardCheck },
      { label: "Cuti Guru", path: "/admin/teachers/leave", icon: CalendarDays },
      { label: "Dokumen Guru", path: "/admin/teachers/documents", icon: FileText },
    ],
  },
  {
    label: "PPDB",
    items: [
      { label: "Pendaftaran", path: "/admin/ppdb/registrations", icon: UserPlus },
      { label: "Verifikasi", path: "/admin/ppdb/verification", icon: ShieldCheck },
      { label: "Daftar Ulang", path: "/admin/ppdb/re-registration", icon: ArrowLeftRight },
      { label: "Export Excel", path: "/admin/ppdb/export-dapodik", icon: FileText },
    ],
  },
  {
    label: "Keuangan",
    items: [
      { label: "Jenis Tagihan", path: "/admin/finance/fee-types", icon: CreditCard },
      { label: "Penagihan", path: "/admin/finance/billing", icon: Receipt },
      { label: "Pembayaran", path: "/admin/finance/payments", icon: Wallet },
      { label: "Transaksi", path: "/admin/finance/transactions", icon: DollarSign },
      { label: "Beasiswa", path: "/admin/finance/scholarships", icon: PiggyBank },
      { label: "Laporan Keuangan", path: "/admin/finance/reports", icon: TrendingUp },
    ],
  },
  {
    label: "Kesiswaan",
    items: [
      { label: "Bimbingan & Konseling", path: "/admin/development/counseling", icon: Stethoscope },
      { label: "Ekstrakurikuler", path: "/admin/development/extracurricular", icon: Dumbbell },
      { label: "Prestasi", path: "/admin/development/achievements", icon: Trophy },
      { label: "Pelanggaran", path: "/admin/development/violations", icon: ShieldAlert },
    ],
  },
  {
    label: "Sarana & Prasarana",
    items: [
      { label: "Ruangan", path: "/admin/facilities/rooms", icon: BedDouble },
      { label: "Aset", path: "/admin/facilities/assets", icon: Package },
      { label: "Pemeliharaan", path: "/admin/facilities/maintenance", icon: Wrench },
      { label: "Inventaris", path: "/admin/facilities/inventory", icon: Building2 },
    ],
  },
  {
    label: "Administrasi",
    items: [
      { label: "Surat Masuk", path: "/admin/administration/incoming", icon: Mail },
      { label: "Surat Keluar", path: "/admin/administration/outgoing", icon: Send },
      { label: "Dokumen", path: "/admin/administration/documents", icon: FileStack },
      { label: "Disposisi", path: "/admin/administration/dispositions", icon: FolderOpen },
    ],
  },
  {
    label: "Komunikasi",
    items: [
      { label: "Pengumuman", path: "/admin/communication/announcements", icon: Megaphone },
      { label: "Notifikasi", path: "/admin/communication/notifications", icon: Bell },
      { label: "Kalender", path: "/admin/communication/calendar", icon: CalendarClock },
    ],
  },
  {
    label: "Soal & Ujian",
    items: [
      { label: "Bank Soal", path: "/admin/examinations/questions", icon: BrainCircuit },
      { label: "Ujian", path: "/admin/examinations/exams", icon: ClipboardList },
      { label: "Jadwal Ujian", path: "/admin/examinations/schedules", icon: CalendarClock },
      { label: "Sesi Ujian", path: "/admin/examinations/sessions", icon: Activity },
      { label: "Peserta Ujian", path: "/admin/examinations/participants", icon: Users },
      { label: "Hasil Ujian", path: "/admin/examinations/results", icon: BarChart3 },
    ],
  },
  {
    label: "Laporan",
    items: [
      { label: "Laporan Akademik", path: "/admin/reports/academic", icon: GraduationCap },
      { label: "Laporan Siswa", path: "/admin/reports/students", icon: Users },
      { label: "Laporan Guru", path: "/admin/reports/teachers", icon: UserCog },
      { label: "Laporan Keuangan", path: "/admin/reports/finance", icon: DollarSign },
      { label: "Laporan Kehadiran", path: "/admin/reports/attendance", icon: ClipboardCheck },
      { label: "Laporan Inventaris", path: "/admin/reports/inventory", icon: Package },
    ],
  },
  {
    label: "Sistem",
    items: [
      { label: "Peran", path: "/admin/system/roles", icon: Shield },
      { label: "Hak Akses", path: "/admin/system/permissions", icon: KeyRound },
      { label: "Pengguna", path: "/admin/system/users", icon: Users },
      { label: "Log Aktivitas", path: "/admin/system/audit-logs", icon: ScrollText },
      { label: "Pengaturan", path: "/admin/system/settings", icon: Cog },
    ],
  },
];

export const dashboardItem = {
  label: "Dasbor",
  path: "/admin/dashboard",
  icon: LayoutDashboard,
} as const;

export const studentDashboardItem = {
  label: "Dasbor",
  path: "/siswa",
  icon: LayoutDashboard,
} as const;

// Student Portal navigation — `navOverlay` pattern like Admin `navigation`
export const studentNavigation = [
  {
    label: "Akademik",
    items: [
      { label: "Nilai", path: "/siswa/grades", icon: Award },
      { label: "Jadwal", path: "/siswa/schedule", icon: CalendarClock },
      { label: "Kehadiran", path: "/siswa/attendance", icon: ClipboardCheck },
    ],
  },
  {
    label: "Keuangan",
    items: [
      { label: "Ringkasan", path: "/siswa/finance/summary", icon: PiggyBank },
      { label: "Tagihan", path: "/siswa/finance/billings", icon: Receipt },
      { label: "Pembayaran", path: "/siswa/finance/payments", icon: Wallet },
      { label: "Transaksi", path: "/siswa/finance/transactions", icon: DollarSign },
      { label: "Beasiswa", path: "/siswa/finance/scholarships", icon: BadgePercent },
    ],
  },
  {
    label: "Aktivitas",
    items: [
      { label: "Tugas", path: "/siswa/assignments", icon: ClipboardList },
      { label: "Ujian", path: "/siswa/exams", icon: BookOpen },
      { label: "Prestasi", path: "/siswa/achievements", icon: Trophy },
      { label: "Pelanggaran", path: "/siswa/violations", icon: ShieldAlert },
      { label: "Ekstrakurikuler", path: "/siswa/extracurricular", icon: Dumbbell },
    ],
  },
];


