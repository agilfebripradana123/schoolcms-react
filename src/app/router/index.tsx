import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import ModulePlaceholder from "@/components/ui/ModulePlaceholder";
import ProtectedRoute from "@/features/auth/ProtectedRoute";

const academicModules = [
  { path: "years", title: "Academic Year" },
  { path: "semesters", title: "Semester" },
  { path: "curriculum", title: "Curriculum" },
  { path: "subjects", title: "Subjects" },
  { path: "classes", title: "Classes" },
  { path: "class-subjects", title: "Class Subjects" },
  { path: "class-students", title: "Class Students" },
  { path: "schedules", title: "Schedules" },
  { path: "periods", title: "Periods" },
  { path: "assignments", title: "Assignments" },
  { path: "grades", title: "Grades" },
  { path: "report-cards", title: "Report Cards" },
];

const studentModules = [
  { path: "", title: "Student Data" },
  { path: "parents", title: "Parents" },
  { path: "guardians", title: "Guardians" },
  { path: "history", title: "Student History" },
  { path: "attendance", title: "Attendance" },
  { path: "transfers", title: "Transfers" },
  { path: "alumni", title: "Alumni" },
  { path: "id-card", title: "Student ID Card" },
];

const teacherModules = [
  { path: "", title: "Teachers" },
  { path: "staff", title: "Staff" },
  { path: "assignments", title: "Teaching Assignments" },
  { path: "attendance", title: "Teacher Attendance" },
  { path: "leave", title: "Teacher Leave" },
  { path: "documents", title: "Teacher Documents" },
];

const ppdbModules = [
  { path: "registrations", title: "Registration" },
  { path: "verification", title: "Verification" },
  { path: "selection", title: "Selection" },
  { path: "re-registration", title: "Re-registration" },
];

const financeModules = [
  { path: "fee-types", title: "Fee Types" },
  { path: "billing", title: "Billing" },
  { path: "payments", title: "Payments" },
  { path: "transactions", title: "Transactions" },
  { path: "scholarships", title: "Scholarships" },
  { path: "reports", title: "Financial Reports" },
];

const developmentModules = [
  { path: "counseling", title: "Counseling" },
  { path: "extracurricular", title: "Extracurricular" },
  { path: "achievements", title: "Achievements" },
  { path: "violations", title: "Violations" },
];

const facilityModules = [
  { path: "rooms", title: "Rooms" },
  { path: "assets", title: "Assets" },
  { path: "maintenance", title: "Maintenance" },
  { path: "inventory", title: "Inventory" },
];

const adminModules = [
  { path: "incoming", title: "Incoming Letters" },
  { path: "outgoing", title: "Outgoing Letters" },
  { path: "documents", title: "Documents" },
  { path: "dispositions", title: "Dispositions" },
];

const communicationModules = [
  { path: "announcements", title: "Announcements" },
  { path: "notifications", title: "Notifications" },
  { path: "calendar", title: "Calendar" },
];

const examModules = [
  { path: "questions", title: "Question Banks" },
  { path: "exams", title: "Exams" },
  { path: "schedules", title: "Exam Schedules" },
  { path: "sessions", title: "Exam Sessions" },
  { path: "participants", title: "Exam Participants" },
  { path: "results", title: "Exam Results" },
];

const reportModules = [
  { path: "academic", title: "Academic Reports" },
  { path: "students", title: "Student Reports" },
  { path: "teachers", title: "Teacher Reports" },
  { path: "finance", title: "Finance Reports" },
  { path: "attendance", title: "Attendance Reports" },
  { path: "inventory", title: "Inventory Reports" },
];

const systemModules = [
  { path: "roles", title: "Roles" },
  { path: "permissions", title: "Permissions" },
  { path: "users", title: "Users" },
  { path: "audit-logs", title: "Audit Logs" },
  { path: "settings", title: "Settings" },
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
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
