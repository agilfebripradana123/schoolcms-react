import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { gradeService } from "../../api/grade.service";
import { classService } from "../../api/class.service";
import { subjectService } from "../../api/subject.service";
import { academicYearService } from "../../api/academic-year.service";
import { studentService } from "@/features/students/api/student.service";
import type {
  AcademicYear,
  CreateGradePayload,
  Grade,
  GradeType,
  SchoolClass,
  Subject,
} from "../../api/types";
import type { Student } from "@/features/students/api/types";

interface GradeFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Grade | null;
}

const TYPE_OPTIONS: Array<{ value: GradeType; label: string }> = [
  { value: "tugas", label: "Tugas" },
  { value: "uts", label: "UTS" },
  { value: "uas", label: "UAS" },
];

const SEMESTER_OPTIONS = [
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
];

export default function GradeForm({
  open,
  onClose,
  onSaved,
  initialData,
}: GradeFormProps) {
  const [studentId, setStudentId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [type, setType] = useState<GradeType>("tugas");
  const [score, setScore] = useState("");
  const [semester, setSemester] = useState("1");
  const [academicYear, setAcademicYear] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState(false);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [classesError, setClassesError] = useState(false);

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [yearsLoading, setYearsLoading] = useState(false);
  const [yearsError, setYearsError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadStudents = useCallback(() => {
    setStudentsLoading(true);
    setStudentsError(false);
    studentService
      .list({ per_page: 200 })
      .then((res) => {
        setStudents(res.data);
        setStudentsError(false);
      })
      .catch(() => {
        setStudentsError(true);
      })
      .finally(() => {
        setStudentsLoading(false);
      });
  }, []);

  const loadSubjects = useCallback(() => {
    setSubjectsLoading(true);
    setSubjectsError(false);
    subjectService
      .list()
      .then((res) => {
        setSubjects(res.data);
        setSubjectsError(false);
      })
      .catch(() => {
        setSubjectsError(true);
      })
      .finally(() => {
        setSubjectsLoading(false);
      });
  }, []);

  const loadClasses = useCallback(() => {
    setClassesLoading(true);
    setClassesError(false);
    classService
      .list()
      .then((res) => {
        setClasses(res.data);
        setClassesError(false);
      })
      .catch(() => {
        setClassesError(true);
      })
      .finally(() => {
        setClassesLoading(false);
      });
  }, []);

  const loadYears = useCallback(() => {
    setYearsLoading(true);
    setYearsError(false);
    academicYearService
      .list({ per_page: 100 })
      .then((res) => {
        setYears(res.data);
        setYearsError(false);
      })
      .catch(() => {
        setYearsError(true);
      })
      .finally(() => {
        setYearsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});
      loadStudents();
      loadSubjects();
      loadClasses();
      loadYears();

      if (initialData) {
        setStudentId(String(initialData.student_id));
        setSubjectId(String(initialData.subject_id));
        setClassId(String(initialData.class_id));
        setType(initialData.type);
        setScore(initialData.score != null ? String(initialData.score) : "");
        setSemester(initialData.semester || "1");
        setAcademicYear(initialData.academic_year || "");
      } else {
        setStudentId("");
        setSubjectId("");
        setClassId("");
        setType("tugas");
        setScore("");
        setSemester("1");
        setAcademicYear("");
      }
    }
  }, [open, initialData, loadStudents, loadSubjects, loadClasses, loadYears]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const scoreNum = Number(score);
    if (!score || Number.isNaN(scoreNum)) {
      setError({ message: "Nilai wajib diisi dengan angka." });
      setSubmitting(false);
      return;
    }
    if (scoreNum < 0 || scoreNum > 100) {
      setError({ message: "Nilai harus berada di antara 0 sampai 100." });
      setSubmitting(false);
      return;
    }

    const payload: CreateGradePayload = {
      student_id: Number(studentId),
      subject_id: Number(subjectId),
      class_id: Number(classId),
      type,
      score: scoreNum,
      semester,
      academic_year: academicYear,
    };

    try {
      if (initialData) {
        await gradeService.update(initialData.id, payload);
        toast.success("Nilai berhasil diperbarui.");
      } else {
        await gradeService.create(payload);
        toast.success("Nilai berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan nilai", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const studentOptions = students.map((s) => ({ value: String(s.id), label: s.name }));
  const subjectOptions = subjects.map((s) => ({ value: String(s.id), label: s.name }));
  const classOptions = classes.map((c) => ({ value: String(c.id), label: c.name }));
  const yearOptions = years.map((y) => ({ value: y.name, label: y.name }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Nilai" : "Tambah Nilai"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="grade-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="grade-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Siswa" required error={fieldErrors.student_id?.[0]}>
            {studentsLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat siswa...
              </div>
            ) : studentsError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data siswa.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadStudents}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : students.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada siswa tersedia.
              </p>
            ) : (
              <AppSelect
                value={studentId}
                onChange={(v) => setStudentId(v ?? "")}
                options={studentOptions}
                placeholder="Pilih Siswa"
                isDisabled={submitting}
              />
            )}
          </FormField>

          <FormField label="Mata Pelajaran" required error={fieldErrors.subject_id?.[0]}>
            {subjectsLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat mata pelajaran...
              </div>
            ) : subjectsError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data mata pelajaran.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadSubjects}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : subjects.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada mata pelajaran tersedia.
              </p>
            ) : (
              <AppSelect
                value={subjectId}
                onChange={(v) => setSubjectId(v ?? "")}
                options={subjectOptions}
                placeholder="Pilih Mata Pelajaran"
                isDisabled={submitting}
              />
            )}
          </FormField>

          <FormField label="Kelas" required error={fieldErrors.class_id?.[0]}>
            {classesLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat kelas...
              </div>
            ) : classesError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data kelas.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadClasses}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : classes.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada kelas tersedia.
              </p>
            ) : (
              <AppSelect
                value={classId}
                onChange={(v) => setClassId(v ?? "")}
                options={classOptions}
                placeholder="Pilih Kelas"
                isDisabled={submitting}
              />
            )}
          </FormField>

          <FormField label="Jenis Nilai" required error={fieldErrors.type?.[0]}>
            <AppSelect
              value={type}
              onChange={(v) => setType((v ?? "tugas") as GradeType)}
              options={TYPE_OPTIONS}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>

          <FormField
            label="Nilai"
            required
            hint="0.00 - 100.00"
            error={fieldErrors.score?.[0]}
          >
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="85.5"
              disabled={submitting}
            />
          </FormField>

          <FormField label="Semester" required error={fieldErrors.semester?.[0]}>
            <AppSelect
              value={semester}
              onChange={(v) => setSemester(v ?? "1")}
              options={SEMESTER_OPTIONS}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Tahun Ajaran" required error={fieldErrors.academic_year?.[0]}>
          {yearsLoading ? (
            <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Memuat tahun ajaran...
            </div>
          ) : yearsError ? (
            <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
              <span>Gagal memuat data tahun ajaran.</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={loadYears}
                className="self-start"
              >
                Muat Ulang
              </Button>
            </div>
          ) : years.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
              Tidak ada tahun ajaran tersedia.
            </p>
          ) : (
            <AppSelect
              value={academicYear}
              onChange={(v) => setAcademicYear(v ?? "")}
              options={yearOptions}
              placeholder="Pilih Tahun Ajaran"
              isDisabled={submitting}
            />
          )}
        </FormField>

        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}