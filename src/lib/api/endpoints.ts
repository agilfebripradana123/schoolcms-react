export const AUTH = {
  LOGIN: "/login",
  ME: "/me",
  LOGOUT: "/logout",
} as const;

export const ACADEMIC = {
  ACADEMIC_YEARS: "/academic-years",
  SEMESTERS: "/semesters",
  CURRICULUMS: "/curriculums",
  SUBJECTS: "/subjects",
  CLASSES: "/classes",
  CLASS_SUBJECTS: "/class-subjects",
  CLASS_STUDENTS: "/class-students",
  TEACHER_ASSIGNMENTS: "/teacher-assignments",
  SCHEDULES: "/schedules",
  PERIODS: "/periods",
  ASSIGNMENTS: "/assignments",
  GRADES: "/grades",
  REPORT_CARDS: "/report-cards",
} as const;

export const STUDENTS = {
  STUDENTS: "/students",
  PARENTS: "/parents",
  GUARDIANS: "/guardians",
  STUDENT_HISTORIES: "/student-histories",
  ATTENDANCES: "/attendance",
  TRANSFERS: "/transfers",
  ALUMNI: "/alumni",
  STUDENT_ID_CARDS: "/student-id-cards",
} as const;

export const STAFF = {
  TEACHERS: "/teachers",
  STAFF: "/staff",
  TEACHER_ASSIGNMENTS: "/teacher-assignments",
  TEACHER_ATTENDANCES: "/teacher-attendances",
  TEACHER_LEAVES: "/teacher-leaves",
  TEACHER_DOCUMENTS: "/teacher-documents",
} as const;

export const PPDB = {
  REGISTRATIONS: "/registrations",
} as const;

export const FINANCE = {
  FEE_TYPES: "/fee-types",
  BILLINGS: "/billings",
  PAYMENTS: "/payments",
  PAYMENT_TRANSACTIONS: "/payment-transactions",
  SCHOLARSHIPS: "/scholarships",
  FINANCIAL_REPORTS: "/financial-reports",
} as const;

export const FACILITIES = {
  ROOMS: "/rooms",
  ASSETS: "/assets",
  MAINTENANCE: "/maintenance",
  INVENTORY: "/inventory",
} as const;

export const ADMINISTRATION = {
  INCOMING_LETTERS: "/incoming-letters",
  OUTGOING_LETTERS: "/outgoing-letters",
  DISPOSITIONS: "/dispositions",
  DOCUMENTS: "/documents",
} as const;

export const COMMUNICATION = {
  ANNOUNCEMENTS: "/announcements",
  NOTIFICATIONS: "/notifications",
  NOTIFICATIONS_MY: "/notifications/my",
  CALENDARS: "/calendars",
} as const;

export const EXAMINATION = {
  EXAMS: "/exams",
  QUESTIONS: "/questions",
  EXAM_SESSIONS: "/exam-sessions",
  EXAM_SCHEDULES: "/exam-schedules",
  EXAM_INSTRUCTIONS: "/exam-instructions",
  EXAM_PARTICIPANTS: "/exam-participants",
  EXAM_RESULTS: "/exam-results",
  EXAM_ANSWERS: "/exam-answers",
} as const;

export const DEVELOPMENT = {
  COUNSELINGS: "/counselings",
  EXTRACURRICULARS: "/extracurriculums",
  ACHIEVEMENTS: "/achievements",
  VIOLATIONS: "/violations",
} as const;

export const SYSTEM = {
  ROLES: "/roles",
  PERMISSIONS: "/permissions",
  USERS: "/users",
  AUDIT_LOGS: "/audit-logs",
  SETTINGS: "/settings",
} as const;
