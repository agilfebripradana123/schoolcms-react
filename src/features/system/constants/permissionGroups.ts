export interface PermissionGroupDef {
  label: string;
  names: string[];
}

export const PERMISSION_GROUPS: PermissionGroupDef[] = [
  { label: "Akademik", names: ["manage-classes","manage-schedules","manage-subjects","manage-academic-years","view-classes","view-students","view-schedules","view-attendance","manage-attendance","view-grades","manage-grades","view-assignments","manage-assignments","finalize-grades"] },
  { label: "Ujian", names: ["manage-exams","view-exams","view-exam-schedules","view-exam-results","view-exam-monitoring"] },
  { label: "Siswa", names: ["manage-students","view-achievements","view-violations","view-extracurricular","view-counselings"] },
  { label: "Keuangan", names: ["manage-finance","manage-scholarships","view-finance","view-billings","view-payments","view-transactions","view-scholarships"] },
  { label: "Operasional", names: ["manage-announcements","manage-notifications","manage-calendars","manage-facilities","view-reports"] },
  { label: "Manajemen", names: ["manage-teachers","manage-staff","manage-development","manage-letters","manage-documents"] },
];