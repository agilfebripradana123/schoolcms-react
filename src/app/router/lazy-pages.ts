import { lazy } from "react";

export const AcademicYearPage = lazy(() => import("@/features/academic/pages/AcademicYearPage"));
export const SemesterPage = lazy(() => import("@/features/academic/pages/SemesterPage"));
export const CurriculumPage = lazy(() => import("@/features/academic/pages/CurriculumPage"));
export const SubjectsPage = lazy(() => import("@/features/academic/pages/SubjectsPage"));
export const ClassesPage = lazy(() => import("@/features/academic/pages/ClassesPage"));
export const ClassSubjectsPage = lazy(() => import("@/features/academic/pages/ClassSubjectsPage"));
export const ClassStudentsPage = lazy(() => import("@/features/academic/pages/ClassStudentsPage"));
export const SchedulesPage = lazy(() => import("@/features/academic/pages/SchedulesPage"));
export const PeriodsPage = lazy(() => import("@/features/academic/pages/PeriodsPage"));
export const AssignmentsPage = lazy(() => import("@/features/academic/pages/AssignmentsPage"));
export const GradesPage = lazy(() => import("@/features/academic/pages/GradesPage"));
export const ReportCardsPage = lazy(() => import("@/features/academic/pages/ReportCardsPage"));

export const StudentListPage = lazy(() => import("@/features/students/pages/StudentListPage"));
export const HistoryListPage = lazy(() => import("@/features/students/pages/HistoryListPage"));
export const AttendanceListPage = lazy(() => import("@/features/students/pages/AttendanceListPage"));
export const TransferListPage = lazy(() => import("@/features/students/pages/TransferListPage"));
export const AlumniListPage = lazy(() => import("@/features/students/pages/AlumniListPage"));
export const StudentIdCardListPage = lazy(() => import("@/features/students/pages/StudentIdCardListPage"));

export const TeacherListPage = lazy(() => import("@/features/teachers-staff/pages/TeacherListPage"));
export const StaffListPage = lazy(() => import("@/features/teachers-staff/pages/StaffListPage"));
export const TeacherAssignmentsPage = lazy(() => import("@/features/teachers-staff/pages/TeacherAssignmentsPage"));
export const TeacherAttendanceListPage = lazy(() => import("@/features/teachers-staff/pages/TeacherAttendanceListPage"));
export const TeacherLeaveListPage = lazy(() => import("@/features/teachers-staff/pages/TeacherLeaveListPage"));
export const TeacherDocumentListPage = lazy(() => import("@/features/teachers-staff/pages/TeacherDocumentListPage"));

export const RegistrationsPage = lazy(() => import("@/features/ppdb/pages/RegistrationsPage"));
export const VerificationPage = lazy(() => import("@/features/ppdb/pages/VerificationPage"));
export const ReRegistrationPage = lazy(() => import("@/features/ppdb/pages/ReRegistrationPage"));
export const ExportDapodikPage = lazy(() => import("@/features/ppdb/pages/ExportDapodikPage"));

export const FeeTypesPage = lazy(() => import("@/features/finance/pages/FeeTypesPage"));
export const BillingsPage = lazy(() => import("@/features/finance/pages/BillingsPage"));
export const PaymentsPage = lazy(() => import("@/features/finance/pages/PaymentsPage"));
export const TransactionsPage = lazy(() => import("@/features/finance/pages/TransactionsPage"));
export const ScholarshipsPage = lazy(() => import("@/features/finance/pages/ScholarshipsPage"));
export const FinancialReportsPage = lazy(() => import("@/features/finance/pages/FinancialReportsPage"));

export const QuestionsPage = lazy(() => import("@/features/examinations/pages/QuestionsPage"));
export const ExamsPage = lazy(() => import("@/features/examinations/pages/ExamsPage"));
export const ExamSchedulesPage = lazy(() => import("@/features/examinations/pages/ExamSchedulesPage"));
export const ExamSessionsPage = lazy(() => import("@/features/examinations/pages/ExamSessionsPage"));
export const ExamParticipantsPage = lazy(() => import("@/features/examinations/pages/ExamParticipantsPage"));
export const ExamResultsPage = lazy(() => import("@/features/examinations/pages/ExamResultsPage"));

export const RoomsPage = lazy(() => import("@/features/facilities/pages/RoomsPage"));
export const AssetsPage = lazy(() => import("@/features/facilities/pages/AssetsPage"));
export const MaintenancesPage = lazy(() => import("@/features/facilities/pages/MaintenancesPage"));
export const InventoryPage = lazy(() => import("@/features/facilities/pages/InventoryPage"));

export const IncomingLettersPage = lazy(() => import("@/features/administration/pages/IncomingLettersPage"));
export const OutgoingLettersPage = lazy(() => import("@/features/administration/pages/OutgoingLettersPage"));
export const DocumentsPage = lazy(() => import("@/features/administration/pages/DocumentsPage"));
export const DispositionsPage = lazy(() => import("@/features/administration/pages/DispositionsPage"));

export const CounselingsPage = lazy(() => import("@/features/studentship/pages/CounselingsPage"));
export const ExtracurricularsPage = lazy(() => import("@/features/studentship/pages/ExtracurricularsPage"));
export const AchievementsPage = lazy(() => import("@/features/studentship/pages/AchievementsPage"));
export const ViolationsPage = lazy(() => import("@/features/studentship/pages/ViolationsPage"));
