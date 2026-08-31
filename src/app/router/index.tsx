import { createBrowserRouter, Navigate } from "react-router-dom";
import { StudentListPage, HistoryListPage, AttendanceListPage, TransferListPage, AlumniListPage, StudentIdCardListPage } from "@/features/students";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import ModulePlaceholder from "@/components/ui/ModulePlaceholder";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import RoleRoute from "@/features/auth/RoleRoute";
import { AcademicYearPage, SemesterPage, CurriculumPage, SubjectsPage, ClassesPage, ClassSubjectsPage, ClassStudentsPage, TeacherAssignmentsPage, SchedulesPage, PeriodsPage, AssignmentsPage, GradesPage, ReportCardsPage } from "@/features/academic";
import { TeacherListPage, StaffListPage, TeacherAttendanceListPage, TeacherLeaveListPage, TeacherDocumentListPage } from "@/features/teachers-staff";
import { RegistrationsPage, VerificationPage, SelectionPage, ReRegistrationPage } from "@/features/ppdb";
import { FeeTypesPage, BillingsPage, PaymentsPage, TransactionsPage, ScholarshipsPage, FinancialReportsPage } from "@/features/finance";

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
          { path: "academic/years", element: <AcademicYearPage /> },
          { path: "academic/semesters", element: <SemesterPage /> },
          { path: "academic/curriculum", element: <CurriculumPage /> },
          { path: "academic/subjects", element: <SubjectsPage /> },
          { path: "academic/classes", element: <ClassesPage /> },
          { path: "academic/class-subjects", element: <ClassSubjectsPage /> },
          { path: "academic/class-students", element: <ClassStudentsPage /> },
          { path: "academic/teacher-assignments", element: <TeacherAssignmentsPage /> },
          { path: "academic/schedules", element: <SchedulesPage /> },
          { path: "academic/periods", element: <PeriodsPage /> },
          { path: "academic/assignments", element: <AssignmentsPage /> },
          { path: "academic/grades", element: <GradesPage /> },
          { path: "academic/report-cards", element: <ReportCardsPage /> },
          { path: "students", element: <StudentListPage /> },
          { path: "students/history", element: <HistoryListPage /> },
          { path: "students/attendance", element: <AttendanceListPage /> },
          { path: "students/transfers", element: <TransferListPage /> },
          { path: "students/alumni", element: <AlumniListPage /> },
          { path: "students/id-card", element: <StudentIdCardListPage /> },
          { path: "finance/fee-types", element: <FeeTypesPage /> },
          { path: "finance/billing", element: <BillingsPage /> },
          { path: "finance/payments", element: <PaymentsPage /> },
          { path: "finance/transactions", element: <TransactionsPage /> },
          { path: "finance/scholarships", element: <ScholarshipsPage /> },
          { path: "finance/reports", element: <FinancialReportsPage /> },
          { path: "teachers", element: <TeacherListPage /> },
          { path: "teachers/staff", element: <StaffListPage /> },
          { path: "teachers/assignments", element: <TeacherAssignmentsPage /> },
          { path: "teachers/attendance", element: <TeacherAttendanceListPage /> },
          { path: "teachers/leave", element: <TeacherLeaveListPage /> },
          { path: "teachers/documents", element: <TeacherDocumentListPage /> },
          {
            element: <RoleRoute allow={["admin", "administrator"]} />,
            children: [
              { path: "ppdb/registrations", element: <RegistrationsPage /> },
              { path: "ppdb/verification", element: <VerificationPage /> },
              { path: "ppdb/selection", element: <SelectionPage /> },
              { path: "ppdb/re-registration", element: <ReRegistrationPage /> },
            ],
          },
          ...createModuleRoutes("/development", "Student Development", developmentModules),
          ...createModuleRoutes("/facilities", "Facilities", facilityModules),
          ...createModuleRoutes("/administration", "Administration", adminModules),
          ...createModuleRoutes("/communication", "Communication", communicationModules),
          ...createModuleRoutes("/examinations", "Question & Examination", examModules),
          ...createModuleRoutes("/reports", "Reports", reportModules),
          ...createModuleRoutes("/system", "System", systemModules),
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
