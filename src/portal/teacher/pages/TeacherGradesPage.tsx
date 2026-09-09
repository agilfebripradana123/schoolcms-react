import { useCallback, useEffect, useMemo, useState } from "react";
import { Save, Award, Filter } from "lucide-react";
import { toast } from "sonner";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import PortalFilterBar from "@/portal/components/PortalFilterBar";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { usePermission } from "@/features/auth/usePermission";
import { teacherGradeService, myAssignmentService } from "@/features/academic";
import { semesterService } from "@/features/academic/api/semester.service";
import type {
  GradeType,
  Semester,
  TeacherGradeAssignment,
  TeacherGradeStudent,
} from "@/features/academic/api/types";
import { GRADE_TYPES, GRADE_TYPE_LABELS } from "@/features/academic/api/types";
import { toApiError } from "@/lib/api";
import type { SelectOption } from "@/components/ui/Select";

export default function TeacherGradesPage() {
  const { can } = usePermission();
  const canManage = can("manage-grades");

  const [assignments, setAssignments] = useState<TeacherGradeAssignment[]>([]);
  const [classId, setClassId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [type, setType] = useState<GradeType>("tugas");
  const [semesterId, setSemesterId] = useState<number | null>(null);
  const [academicYearId, setAcademicYearId] = useState<number | null>(null);

  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [rows, setRows] = useState<TeacherGradeStudent[]>([]);
  const [scoreById, setScoreById] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "empty">("idle");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadAssignments = useCallback(() => {
    myAssignmentService
      .list({ per_page: 100 })
      .then((res) => {
        const data = (res.data ?? []).map((a) => ({
          id: a.id,
          class_id: a.class_id,
          class_name: a.class?.name,
          subject_id: a.subject_id,
          subject_name: a.subject?.name,
          academic_year_id: a.academic_year_id,
          academic_year_name: a.academic_year?.name,
        }));
        setAssignments(data);
        const first = data[0];
        if (!first) return;
        setClassId(first.class_id);
        setAcademicYearId(first.academic_year_id);
      })
      .catch(() => setAssignments([]));
  }, []);

  const loadSemesters = useCallback(() => {
    semesterService
      .list({ per_page: 100 })
      .then((res) => setSemesters(res.data))
      .catch(() => setSemesters([]));
  }, []);

  useEffect(() => {
    loadAssignments();
    loadSemesters();
  }, [loadAssignments, loadSemesters]);

  const classOptions = useMemo<SelectOption<number>[]>(() => {
    const seen = new Map<number, string>();
    for (const a of assignments) {
      if (!seen.has(a.class_id)) seen.set(a.class_id, a.class_name ?? `Kelas ${a.class_id}`);
    }
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }, [assignments]);

  const subjectOptions = useMemo<SelectOption<number>[]>(() => {
    const seen = new Map<number, string>();
    for (const a of assignments) {
      if (classId !== null && a.class_id !== classId) continue;
      if (!seen.has(a.subject_id)) seen.set(a.subject_id, a.subject_name ?? `Mapel ${a.subject_id}`);
    }
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }, [assignments, classId]);

  const yearOptions = useMemo<SelectOption<number>[]>(() => {
    const seen = new Map<number, string>();
    for (const a of assignments) {
      if (a.academic_year_id != null && !seen.has(a.academic_year_id)) {
        seen.set(a.academic_year_id, a.academic_year_name ?? `Tahun ${a.academic_year_id}`);
      }
    }
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }, [assignments]);

  const semesterOptions = useMemo<SelectOption<number>[]>(() => {
    const filtered = academicYearId != null
      ? semesters.filter((s) => s.academic_year_id === academicYearId)
      : semesters;
    return filtered.map((s) => ({ value: s.id, label: `Semester ${s.name}` }));
  }, [semesters, academicYearId]);

  const typeOptions = useMemo<SelectOption<GradeType>[]>(
    () => GRADE_TYPES.map((t) => ({ value: t, label: GRADE_TYPE_LABELS[t] })),
    [],
  );

  const canLoad = classId !== null && subjectId !== null && semesterId !== null && academicYearId !== null;

  const loadRoster = useCallback(() => {
    if (classId === null || subjectId === null || semesterId === null || academicYearId === null) return;
    setStatus("loading");
    setError(null);
    teacherGradeService
      .roster({
        class_id: classId,
        subject_id: subjectId,
        type,
        semester_id: semesterId,
        academic_year_id: academicYearId,
      })
      .then((res) => {
        const students = res.data?.students ?? [];
        setRows(students);
        const next: Record<number, string> = {};
        for (const s of students) next[s.student_id] = s.score === null ? "" : String(s.score);
        setScoreById(next);
        setStatus(students.length === 0 ? "empty" : "ready");
      })
      .catch((err) => setError(toApiError(err).message))
      .finally(() => {});
  }, [classId, subjectId, type, semesterId, academicYearId]);

  const handleSave = async () => {
    if (classId === null || subjectId === null || semesterId === null || academicYearId === null) return;
    const items = rows
      .map((r) => {
        const raw = scoreById[r.student_id]?.trim();
        if (raw === "") return null;
        const score = Number(raw);
        if (Number.isNaN(score) || score < 0 || score > 100) return null;
        return { student_id: r.student_id, score };
      })
      .filter((x): x is { student_id: number; score: number } => x !== null);

    setSaving(true);
    try {
      await teacherGradeService.bulkSave({
        class_id: classId,
        subject_id: subjectId,
        type,
        semester_id: semesterId,
        academic_year_id: academicYearId,
        items,
      });
      toast.success("Nilai berhasil disimpan.");
      loadRoster();
    } catch (err) {
      toast.error("Gagal menyimpan nilai", { description: toApiError(err).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Nilai"
        description="Input nilai siswa pada kelas & mata pelajaran yang menjadi scope mengajar Anda."
      />

      <PortalFilterBar>
          <Filter className="h-4 w-4 text-secondary" />
          <label className="text-sm font-medium text-secondary">Kelas:</label>
          <div className="min-w-[180px]">
            <Select<number> options={classOptions} value={classId} onChange={setClassId} placeholder="Pilih kelas" />
          </div>
          <label className="text-sm font-medium text-secondary">Mapel:</label>
          <div className="min-w-[180px]">
            <Select<number> options={subjectOptions} value={subjectId} onChange={setSubjectId} placeholder="Pilih mapel" />
          </div>
          <label className="text-sm font-medium text-secondary">Komponen:</label>
          <div className="min-w-[150px]">
            <Select<GradeType> options={typeOptions} value={type} onChange={(v) => v && setType(v)} />
          </div>
          <label className="text-sm font-medium text-secondary">Tahun:</label>
          <div className="min-w-[150px]">
            <Select<number> options={yearOptions} value={academicYearId} onChange={(v) => { setAcademicYearId(v); setSemesterId(null); }} placeholder="Tahun" isClearable />
          </div>
          <label className="text-sm font-medium text-secondary">Semester:</label>
          <div className="min-w-[150px]">
            <Select<number> options={semesterOptions} value={semesterId} onChange={setSemesterId} placeholder="Semester" isClearable />
          </div>
          <Button onClick={loadRoster} disabled={!canLoad || status === "loading"}>
            Tampilkan
          </Button>
      </PortalFilterBar>

      {!canLoad ? (
        <PortalEmptyState icon={<Award className="h-10 w-10" />} description="Pilih kelas, mata pelajaran, tahun, dan semester terlebih dahulu." />
      ) : error ? (
        <PortalErrorState message={error} />
      ) : status === "loading" ? (
        <PortalLoadingState />
      ) : status === "empty" ? (
        <PortalEmptyState icon={<Award className="h-10 w-10" />} description="Belum ada data nilai." />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-secondary">{rows.length} siswa</p>
            {canManage && (
              <Button onClick={handleSave} loading={saving} leftIcon={<Save className="h-4 w-4" />}>
                Simpan Nilai
              </Button>
            )}
          </div>
          <DataTable<TeacherGradeStudent>
            loading={false}
            emptyMessage="Belum ada data nilai."
            columns={[
              {
                header: "No",
                accessor: "student_id",
                render: (_v, row) => rows.findIndex((r) => r.student_id === row.student_id) + 1,
              },
              { header: "Nama", accessor: "name", render: (v) => <span className="font-medium text-on-surface">{String(v ?? "-")}</span> },
              { header: "NIS", accessor: "nis", render: (v) => String(v ?? "-") },
              { header: "NISN", accessor: "nisn", render: (v) => String(v ?? "-") },
              {
                header: "Nilai",
                accessor: "student_id",
                render: (_v, row) =>
                  canManage ? (
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      value={scoreById[row.student_id] ?? ""}
                      onChange={(e) =>
                        setScoreById((prev) => ({ ...prev, [row.student_id]: e.target.value }))
                      }
                      className="w-24 rounded-xl border border-outline bg-surface px-3 py-1.5 text-sm text-primary focus:border-primary-container focus:outline-none"
                    />
                  ) : (
                    <span className="text-sm text-primary">
                      {scoreById[row.student_id] !== undefined && scoreById[row.student_id] !== ""
                        ? scoreById[row.student_id]
                        : "---"}
                    </span>
                  ),
              },
            ]}
            data={rows}
          />
        </>
      )}
    </PageContainer>
  );
}
