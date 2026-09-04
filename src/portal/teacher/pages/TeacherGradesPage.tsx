import { useCallback, useEffect, useMemo, useState } from "react";
import { Save, Award } from "lucide-react";
import { toast } from "sonner";
import Select from "@/components/ui/Select";
import Card, { CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { usePermission } from "@/features/auth/usePermission";
import { teacherGradeService, myAssignmentService } from "@/features/academic";
import type {
  GradeType,
  TeacherGradeAssignment,
  TeacherGradeStudent,
} from "@/features/academic/api/types";
import {
  GRADE_TYPES,
  GRADE_TYPE_LABELS,
  SEMESTER_OPTIONS,
} from "@/features/academic/api/types";
import { toApiError } from "@/lib/api";
import type { SelectOption } from "@/components/ui/Select";

export default function TeacherGradesPage() {
  const { can } = usePermission();
  const canManage = can("manage-grades");

  const [assignments, setAssignments] = useState<TeacherGradeAssignment[]>([]);
  const [classId, setClassId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [type, setType] = useState<GradeType>("tugas");
  const [semester, setSemester] = useState<string>("1");
  const [academicYear, setAcademicYear] = useState<string | null>(null);

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
        setAcademicYear(first.academic_year_name ?? null);
      })
      .catch(() => setAssignments([]));
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

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

  const yearOptions = useMemo<SelectOption<string>[]>(() => {
    const seen = new Set<string>();
    for (const a of assignments) {
      if (a.academic_year_name) seen.add(a.academic_year_name);
    }
    return Array.from(seen, (label) => ({ value: label, label }));
  }, [assignments]);

  const typeOptions = useMemo<SelectOption<GradeType>[]>(
    () => GRADE_TYPES.map((t) => ({ value: t, label: GRADE_TYPE_LABELS[t] })),
    [],
  );

  const canLoad = classId !== null && subjectId !== null;

  const loadRoster = useCallback(() => {
    if (classId === null || subjectId === null) return;
    setStatus("loading");
    setError(null);
    teacherGradeService
      .roster({
        class_id: classId,
        subject_id: subjectId,
        type,
        semester,
        academic_year: academicYear ?? undefined,
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
  }, [classId, subjectId, type, semester, academicYear]);

  const handleSave = async () => {
    if (classId === null || subjectId === null) return;
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
        semester,
        academic_year: academicYear ?? undefined,
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
    <PageContainer className="py-6">
      <PageHeader
        title="Nilai"
        description="Input nilai siswa pada kelas & mata pelajaran yang menjadi scope mengajar Anda."
      />

      <Card>
        {/* Filter toolbar */}
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Kelas
            </label>
            <Select<number> options={classOptions} value={classId} onChange={setClassId} placeholder="Pilih kelas" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Mata Pelajaran
            </label>
            <Select<number> options={subjectOptions} value={subjectId} onChange={setSubjectId} placeholder="Pilih mapel" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Komponen
            </label>
            <Select<GradeType> options={typeOptions} value={type} onChange={(v) => v && setType(v)} />
          </div>
        </div>
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Semester
            </label>
            <Select<string>
              options={Array.from(SEMESTER_OPTIONS, (o) => ({ value: o.value, label: o.label }))}
              value={semester}
              onChange={(v) => v && setSemester(v)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Tahun Ajaran
            </label>
            <Select<string> options={yearOptions} value={academicYear} onChange={setAcademicYear} placeholder="Tahun" isClearable />
          </div>
          <div className="flex items-end">
            <Button onClick={loadRoster} disabled={!canLoad || status === "loading"}>
              Tampilkan
            </Button>
          </div>
        </div>

        {/* Content states */}
        {!canLoad ? (
          <div className="py-10 text-center text-sm text-on-surface-variant">
            Pilih kelas dan mata pelajaran terlebih dahulu.
          </div>
        ) : error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">{error}</p>
            <Button variant="secondary" size="sm" onClick={loadRoster}>
              Muat Ulang
            </Button>
          </div>
        ) : status === "loading" ? (
          <div className="py-10 text-center text-sm text-on-surface-variant">
            Memuat nilai...
          </div>
        ) : status === "empty" ? (
          <div className="py-10 text-center">
            <Award className="mx-auto h-8 w-8 text-outline" />
            <p className="mt-2 text-sm font-semibold text-on-surface">Belum ada data nilai.</p>
          </div>
        ) : (
          <>
            <CardHeader
              title="Daftar Nilai"
              description={`${rows.length} siswa`}
              actions={
                canManage ? (
                  <Button onClick={handleSave} loading={saving} leftIcon={<Save className="h-4 w-4" />}>
                    Simpan Nilai
                  </Button>
                ) : undefined
              }
            />
            <DataTable<TeacherGradeStudent>
              loading={false}
              emptyMessage="Belum ada data nilai."
              columns={[
                {
                  header: "No",
                  accessor: "student_id",
                  render: (_v, row) => rows.findIndex((r) => r.student_id === row.student_id) + 1,
                },
                { header: "Nama", accessor: "name", render: (v) => <span className="font-semibold text-on-surface">{String(v ?? "-")}</span> },
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
                        className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-on-surface focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                      />
                    ) : (
                      <span className="text-sm text-on-surface">
                        {scoreById[row.student_id] !== undefined && scoreById[row.student_id] !== ""
                          ? scoreById[row.student_id]
                          : "—"}
                      </span>
                    ),
                },
              ]}
              data={rows}
            />
          </>
        )}
      </Card>
    </PageContainer>
  );
}
