import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { reportCardService } from "../../api/report-card.service";
import { classService } from "../../api/class.service";
import { academicYearService } from "../../api/academic-year.service";
import { semesterService } from "../../api/semester.service";
import { studentService } from "@/features/students/api/student.service";
import type {
  AcademicYear,
  CreateReportCardPayload,
  ReportCard,
  ReportCardStatus,
  SchoolClass,
  Semester,
} from "../../api/types";
import type { Student } from "@/features/students/api/types";

interface ReportCardFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: ReportCard | null;
}

const STATUS_OPTIONS: Array<{ value: ReportCardStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Terbit" },
];

export default function ReportCardForm({
  open,
  onClose,
  onSaved,
  initialData,
}: ReportCardFormProps) {
  const [studentId, setStudentId] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [academicYearId, setAcademicYearId] = useState<string>("");
  const [semesterId, setSemesterId] = useState<string>("");
  const [teacherNotes, setTeacherNotes] = useState("");
  const [status, setStatus] = useState<ReportCardStatus>("draft");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(false);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [classesError, setClassesError] = useState(false);

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [yearsLoading, setYearsLoading] = useState(false);
  const [yearsError, setYearsError] = useState(false);

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [semestersLoading, setSemestersLoading] = useState(false);
  const [semestersError, setSemestersError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadStudents = useCallback(() => {
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

  const loadClasses = useCallback(() => {
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

  const loadSemesters = useCallback(() => {
    semesterService
      .list({ per_page: 100 })
      .then((res) => {
        setSemesters(res.data);
        setSemestersError(false);
      })
      .catch(() => {
        setSemestersError(true);
      })
      .finally(() => {
        setSemestersLoading(false);
      });
  }, []);

  const [previousOpen, setPreviousOpen] = useState(open);
  const [previousInitialData, setPreviousInitialData] = useState(initialData);

  if (open !== previousOpen || initialData !== previousInitialData) {
    setPreviousOpen(open);
    setPreviousInitialData(initialData);

    if (open) {
      setError(null);
      setFieldErrors({});
      setStudentsLoading(true);
      setStudentsError(false);
      setClassesLoading(true);
      setClassesError(false);
      setYearsLoading(true);
      setYearsError(false);
      setSemestersLoading(true);
      setSemestersError(false);

      if (initialData) {
        setStudentId(String(initialData.student_id));
        setClassId(String(initialData.class_id));
        setAcademicYearId(String(initialData.academic_year_id));
        setSemesterId(String(initialData.semester_id));
        setTeacherNotes(initialData.teacher_notes ?? "");
        setStatus(initialData.status);
      } else {
        setStudentId("");
        setClassId("");
        setAcademicYearId("");
        setSemesterId("");
        setTeacherNotes("");
        setStatus("draft");
      }
    }
  }

  useEffect(() => {
    if (open) {
      loadStudents();
      loadClasses();
      loadYears();
      loadSemesters();
    }
  }, [open, loadStudents, loadClasses, loadYears, loadSemesters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateReportCardPayload = {
      student_id: Number(studentId),
      class_id: Number(classId),
      academic_year_id: Number(academicYearId),
      semester_id: Number(semesterId),
      teacher_notes: teacherNotes.trim() || undefined,
      status,
    };

    try {
      if (initialData) {
        await reportCardService.update(initialData.id, payload);
        toast.success("Rapor berhasil diperbarui.");
      } else {
        await reportCardService.create(payload);
        toast.success("Rapor berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan rapor", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const studentOptions = students.map((s) => ({ value: String(s.id), label: s.name }));
  const classOptions = classes.map((c) => ({ value: String(c.id), label: c.name }));
  const yearOptions = years.map((y) => ({ value: String(y.id), label: y.name }));
  const semesterOptions = semesters.map((s) => ({
    value: String(s.id),
    label: `Semester ${s.name}`,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Rapor" : "Tambah Rapor"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="report-card-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="report-card-form"
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
                  onClick={() => {
                    setStudentsLoading(true);
                    setStudentsError(false);
                    loadStudents();
                  }}
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
                  onClick={() => {
                    setClassesLoading(true);
                    setClassesError(false);
                    loadClasses();
                  }}
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

          <FormField label="Tahun Ajaran" required error={fieldErrors.academic_year_id?.[0]}>
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
                  onClick={() => {
                    setYearsLoading(true);
                    setYearsError(false);
                    loadYears();
                  }}
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
                value={academicYearId}
                onChange={(v) => setAcademicYearId(v ?? "")}
                options={yearOptions}
                placeholder="Pilih Tahun Ajaran"
                isDisabled={submitting}
              />
            )}
          </FormField>

          <FormField label="Semester" required error={fieldErrors.semester_id?.[0]}>
            {semestersLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat semester...
              </div>
            ) : semestersError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data semester.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSemestersLoading(true);
                    setSemestersError(false);
                    loadSemesters();
                  }}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : semesters.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada semester tersedia.
              </p>
            ) : (
              <AppSelect
                value={semesterId}
                onChange={(v) => setSemesterId(v ?? "")}
                options={semesterOptions}
                placeholder="Pilih Semester"
                isDisabled={submitting}
              />
            )}
          </FormField>
        </div>

        <FormField
          label="Catatan Guru"
          hint="Opsional."
          error={fieldErrors.teacher_notes?.[0]}
        >
          <Textarea
            value={teacherNotes}
            onChange={(e) => setTeacherNotes(e.target.value)}
            placeholder="Catatan perkembangan siswa..."
            disabled={submitting}
          />
        </FormField>

        <FormField label="Status" required error={fieldErrors.status?.[0]}>
          <AppSelect
            value={status}
            onChange={(v) => setStatus((v ?? "draft") as ReportCardStatus)}
            options={STATUS_OPTIONS}
            isSearchable={false}
            isDisabled={submitting}
          />
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