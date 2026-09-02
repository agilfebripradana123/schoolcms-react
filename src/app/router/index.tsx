import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import GuruLogin from "@/pages/Login/GuruLogin";
import AdminLogin from "@/pages/Login/AdminLogin";
import ModulePlaceholder from "@/components/ui/ModulePlaceholder";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import RoleRoute from "@/features/auth/RoleRoute";
import StudentRoute, { AdminRoute } from "@/features/auth/StudentRoute";
import GuruRoute from "@/features/auth/GuruRoute";
import StudentLayout from "@/features/students/components/StudentLayout";
import GuruLayout from "@/features/students/components/GuruLayout";
import {
  AcademicYearPage,
  SemesterPage,
  CurriculumPage,
  SubjectsPage,
  ClassesPage,
  ClassSubjectsPage,
  ClassStudentsPage,
  SchedulesPage,
  PeriodsPage,
  AssignmentsPage,
  GradesPage,
  ReportCardsPage,
  StudentListPage,
  HistoryListPage,
  AttendanceListPage,
  TransferListPage,
  AlumniListPage,
  StudentIdCardListPage,
  TeacherListPage,
  StaffListPage,
  TeacherAssignmentsPage,
  TeacherAttendanceListPage,
  TeacherLeaveListPage,
  TeacherDocumentListPage,
  RegistrationsPage,
  VerificationPage,
  ReRegistrationPage,
  ExportDapodikPage,
  FeeTypesPage,
  BillingsPage,
  PaymentsPage,
  TransactionsPage,
  ScholarshipsPage,
  FinancialReportsPage,
  QuestionsPage,
  ExamsPage,
  ExamSchedulesPage,
  ExamSessionsPage,
  ExamParticipantsPage,
  ExamResultsPage,
  RoomsPage,
  AssetsPage,
  MaintenancesPage,
  InventoryPage,
  IncomingLettersPage,
  OutgoingLettersPage,
  DocumentsPage,
  DispositionsPage,
  CounselingsPage,
  ExtracurricularsPage,
  AchievementsPage,
  ViolationsPage,
  AnnouncementsPage,
  NotificationsPage,
  CalendarPage,
  StudentPortalPage,
  StudentProfilePage,
  StudentGradesPage,
  StudentSchedulePage,
  StudentAttendancePage,
  StudentFinanceSummaryPage,
  StudentBillingsPage,
  StudentPaymentsPage,
  StudentTransactionsPage,
  StudentScholarshipsPage,
  StudentAssignmentsPage,
  StudentExamsPage,
  StudentAchievementsPage,
  StudentViolationsPage,
  StudentExtracurricularPage,
  StudentNotificationsPage,
} from "./lazy-pages";

const developmentModules = [
  { path: "counseling", title: "Bimbingan & Konseling" },
  { path: "extracurricular", title: "Ekstrakurikuler" },
  { path: "achievements", title: "Prestasi" },
  { path: "violations", title: "Pelanggaran" },
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
    element: <ModulePlaceholder title={mod.title} domain={domain} />,
  }));
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/login/guru",
    element: <GuruLogin />,
  },
  {
    path: "/login/admin",
    element: <AdminLogin />,
  },
  {
    // =========================
    // ADMIN PORTAL (/admin) — Superadmin & Administrator
    // =========================
    path: "/admin",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <Navigate to="/admin/dashboard" replace /> },
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
              { path: "examinations/questions", element: <QuestionsPage /> },
              { path: "examinations/exams", element: <ExamsPage /> },
              { path: "examinations/schedules", element: <ExamSchedulesPage /> },
              { path: "examinations/sessions", element: <ExamSessionsPage /> },
              { path: "examinations/participants", element: <ExamParticipantsPage /> },
              { path: "examinations/results", element: <ExamResultsPage /> },
              { path: "facilities/rooms", element: <RoomsPage /> },
              { path: "facilities/assets", element: <AssetsPage /> },
              { path: "facilities/maintenance", element: <MaintenancesPage /> },
              { path: "facilities/inventory", element: <InventoryPage /> },
              { path: "administration/incoming", element: <IncomingLettersPage /> },
              { path: "administration/outgoing", element: <OutgoingLettersPage /> },
              { path: "administration/documents", element: <DocumentsPage /> },
              { path: "administration/dispositions", element: <DispositionsPage /> },
              { path: "development/counseling", element: <CounselingsPage /> },
              { path: "development/extracurricular", element: <ExtracurricularsPage /> },
              { path: "development/achievements", element: <AchievementsPage /> },
              { path: "development/violations", element: <ViolationsPage /> },
              { path: "communication/announcements", element: <AnnouncementsPage /> },
              { path: "communication/notifications", element: <NotificationsPage /> },
              { path: "communication/calendar", element: <CalendarPage /> },
              {
                element: <RoleRoute allow={["admin", "administrator"]} />,
                children: [
                  { path: "ppdb/registrations", element: <RegistrationsPage /> },
                  { path: "ppdb/verification", element: <VerificationPage /> },
                  { path: "ppdb/re-registration", element: <ReRegistrationPage /> },
                  { path: "ppdb/export-dapodik", element: <ExportDapodikPage /> },
                ],
              },
...createModuleRoutes("development", "Student Development", developmentModules),
          ...createModuleRoutes("reports", "Reports", reportModules),
          ...createModuleRoutes("system", "System", systemModules),
            ],
          },
        ],
      },
    ],
  },
  {
    // =========================
    // GURU PORTAL (/guru) — Guru, layout + guard saja
    // =========================
    path: "/guru",
    element: <ProtectedRoute />,
    children: [
      {
        element: <GuruRoute />,
        children: [
          {
            element: <GuruLayout />,
            children: [
              { index: true, element: <Navigate to="/guru/dashboard" replace /> },
              { path: "dashboard", element: <ModulePlaceholder title="Dashboard Guru" domain="Guru" /> },
              {
                element: <RoleRoute allow={["guru", "admin", "administrator"]} />,
                children: [
                  { path: "academic/classes", element: <ClassesPage /> },
                  { path: "academic/schedules", element: <SchedulesPage /> },
                  { path: "academic/grades", element: <GradesPage /> },
                  { path: "teachers/attendance", element: <TeacherAttendanceListPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    // =========================
    // SISWA PORTAL (/siswa) — Siswa, default home setelah login
    // =========================
    path: "/siswa",
    element: <ProtectedRoute />,
    children: [
      {
        element: <StudentRoute />,
        children: [
          {
            element: <StudentLayout />,
            children: [
              { index: true, element: <Navigate to="/siswa/dashboard" replace /> },
              { path: "dashboard", element: <StudentPortalPage /> },
              { path: "profile", element: <StudentProfilePage /> },
              { path: "grades", element: <StudentGradesPage /> },
              { path: "schedule", element: <StudentSchedulePage /> },
              { path: "attendance", element: <StudentAttendancePage /> },
              { path: "finance/summary", element: <StudentFinanceSummaryPage /> },
              { path: "finance/billings", element: <StudentBillingsPage /> },
              { path: "finance/payments", element: <StudentPaymentsPage /> },
              { path: "finance/transactions", element: <StudentTransactionsPage /> },
              { path: "finance/scholarships", element: <StudentScholarshipsPage /> },
              { path: "assignments", element: <StudentAssignmentsPage /> },
              { path: "exams", element: <StudentExamsPage /> },
              { path: "achievements", element: <StudentAchievementsPage /> },
              { path: "violations", element: <StudentViolationsPage /> },
              { path: "extracurricular", element: <StudentExtracurricularPage /> },
              { path: "notifications", element: <StudentNotificationsPage /> },
            ],
          },
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
