import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import ModulePlaceholder from "@/components/ui/ModulePlaceholder";
import ProtectedRoute from "@/features/auth/ProtectedRoute";

const academicModules = [
  { path: "years", title: "Tahun Ajaran" },
  { path: "semesters", title: "Semester" },
  { path: "curriculum", title: "Kurikulum" },
  { path: "subjects", title: "Mata Pelajaran" },
  { path: "classes", title: "Kelas" },
  { path: "class-subjects", title: "Mata Pelajaran Kelas" },
  { path: "class-students", title: "Siswa Kelas" },
  { path: "schedules", title: "Jadwal" },
  { path: "periods", title: "Jam Pelajaran" },
  { path: "assignments", title: "Tugas" },
  { path: "grades", title: "Nilai" },
  { path: "report-cards", title: "Rapor" },
];

const studentModules = [
  { path: "", title: "Data Siswa" },
  { path: "parents", title: "Orang Tua" },
  { path: "guardians", title: "Wali Siswa" },
  { path: "history", title: "Riwayat Siswa" },
  { path: "attendance", title: "Kehadiran" },
  { path: "transfers", title: "Mutasi Siswa" },
  { path: "alumni", title: "Alumni" },
  { path: "id-card", title: "Kartu Pelajar" },
];

const teacherModules = [
  { path: "", title: "Guru" },
  { path: "staff", title: "Staf" },
  { path: "assignments", title: "Penugasan Mengajar" },
  { path: "attendance", title: "Kehadiran Guru" },
  { path: "leave", title: "Cuti Guru" },
  { path: "documents", title: "Dokumen Guru" },
];

const ppdbModules = [
  { path: "registrations", title: "Pendaftaran" },
  { path: "verification", title: "Verifikasi" },
  { path: "selection", title: "Seleksi" },
  { path: "re-registration", title: "Daftar Ulang" },
];

const financeModules = [
  { path: "fee-types", title: "Jenis Tagihan" },
  { path: "billing", title: "Penagihan" },
  { path: "payments", title: "Pembayaran" },
  { path: "transactions", title: "Transaksi" },
  { path: "scholarships", title: "Beasiswa" },
  { path: "reports", title: "Laporan Keuangan" },
];

const developmentModules = [
  { path: "counseling", title: "Bimbingan & Konseling" },
  { path: "extracurricular", title: "Ekstrakurikuler" },
  { path: "achievements", title: "Prestasi" },
  { path: "violations", title: "Pelanggaran" },
];

const facilityModules = [
  { path: "rooms", title: "Ruangan" },
  { path: "assets", title: "Aset" },
  { path: "maintenance", title: "Pemeliharaan" },
  { path: "inventory", title: "Inventaris" },
];

const adminModules = [
  { path: "incoming", title: "Surat Masuk" },
  { path: "outgoing", title: "Surat Keluar" },
  { path: "documents", title: "Dokumen" },
  { path: "dispositions", title: "Disposisi" },
];

const communicationModules = [
  { path: "announcements", title: "Pengumuman" },
  { path: "notifications", title: "Notifikasi" },
  { path: "calendar", title: "Kalender" },
];

const examModules = [
  { path: "questions", title: "Bank Soal" },
  { path: "exams", title: "Ujian" },
  { path: "schedules", title: "Jadwal Ujian" },
  { path: "sessions", title: "Sesi Ujian" },
  { path: "participants", title: "Peserta Ujian" },
  { path: "results", title: "Hasil Ujian" },
];

const reportModules = [
  { path: "academic", title: "Laporan Akademik" },
  { path: "students", title: "Laporan Siswa" },
  { path: "teachers", title: "Laporan Guru" },
  { path: "finance", title: "Laporan Keuangan" },
  { path: "attendance", title: "Laporan Kehadiran" },
  { path: "inventory", title: "Laporan Inventaris" },
];

const systemModules = [
  { path: "roles", title: "Peran" },
  { path: "permissions", title: "Hak Akses" },
  { path: "users", title: "Pengguna" },
  { path: "audit-logs", title: "Log Aktivitas" },
  { path: "settings", title: "Pengaturan" },
];

function createModuleRoutes(
  basePath: string,
  domain: string,
  modules: Array<{ path: string; title: string }>,
) {
  return modules.map((mod) => ({
    path: mod.path ? `${basePath}/${mod.path}` : basePath,
    element: (
      <ModulePlaceholder title={mod.title} domain={domain} />
    ),
  }));
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          ...createModuleRoutes("/academic", "Academic", academicModules),
          ...createModuleRoutes("/students", "Students", studentModules),
          ...createModuleRoutes("/teachers", "Teachers & Staff", teacherModules),
          ...createModuleRoutes("/ppdb", "PPDB", ppdbModules),
          ...createModuleRoutes("/finance", "Finance", financeModules),
          ...createModuleRoutes("/development", "Student Development", developmentModules),
          ...createModuleRoutes("/facilities", "Facilities", facilityModules),
          ...createModuleRoutes("/administration", "Administration", adminModules),
          ...createModuleRoutes("/communication", "Communication", communicationModules),
          ...createModuleRoutes("/examinations", "Question & Examination", examModules),
          ...createModuleRoutes("/reports", "Reports", reportModules),
          ...createModuleRoutes("/system", "System", systemModules),
        ],
      },
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      ...createModuleRoutes("/academic", "Akademik", academicModules),
      ...createModuleRoutes("/students", "Siswa", studentModules),
      ...createModuleRoutes("/teachers", "Guru & Staf", teacherModules),
      ...createModuleRoutes("/ppdb", "PPDB", ppdbModules),
      ...createModuleRoutes("/finance", "Keuangan", financeModules),
      ...createModuleRoutes("/development", "Kesiswaan", developmentModules),
      ...createModuleRoutes("/facilities", "Sarana & Prasarana", facilityModules),
      ...createModuleRoutes("/administration", "Administrasi", adminModules),
      ...createModuleRoutes("/communication", "Komunikasi", communicationModules),
      ...createModuleRoutes("/examinations", "Soal & Ujian", examModules),
      ...createModuleRoutes("/reports", "Laporan", reportModules),
      ...createModuleRoutes("/system", "Sistem", systemModules),
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
