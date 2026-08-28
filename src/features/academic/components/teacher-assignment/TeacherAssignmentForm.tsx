import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { teacherAssignmentService } from "../../api/teacher-assignment.service";
import { classService } from "../../api/class.service";
import { subjectService } from "../../api/subject.service";
import { academicYearService } from "../../api/academic-year.service";
import { teacherService } from "@/features/teachers-staff/api/teacher.service";
import type { Teacher } from "@/features/teachers-staff/api/types";
import type {
  AcademicYear,
  CreateTeacherAssignmentPayload,
  SchoolClass,
  Subject,
  TeacherAssignment,
} from "../../api/types";

interface TeacherAssignmentFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: TeacherAssignment | null;
}

export default function TeacherAssignmentForm({
  open,
  onClose,
  onSaved,
  initialData,
}: TeacherAssignmentFormProps) {
  const [teacherId, setTeacherId] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [academicYearId, setAcademicYearId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teachersError, setTeachersError] = useState(false);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [classesError, setClassesError] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState(false);

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [yearsLoading, setYearsLoading] = useState(false);
  const [yearsError, setYearsError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadTeachers = useCallback(() => {
    setTeachersLoading(true);
    setTeachersError(false);
    teacherService
      .list()
      .then((res) => {
        setTeachers(res.data);
        setTeachersError(false);
      })
      .catch(() => {
        setTeachersError(true);
      })
      .finally(() => {
        setTeachersLoading(false);
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
      loadTeachers();
      loadClasses();
      loadSubjects();
      loadYears();

      if (initialData) {
        setTeacherId(String(initialData.teacher_id));
        setClassId(String(initialData.class_id));
        setSubjectId(String(initialData.subject_id));
        setAcademicYearId(String(initialData.academic_year_id));
      } else {
        setTeacherId("");
        setClassId("");
        setSubjectId("");
        setAcademicYearId("");
      }
    }
  }, [open, initialData, loadTeachers, loadClasses, loadSubjects, loadYears]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateTeacherAssignmentPayload = {
      teacher_id: Number(teacherId),
      class_id: Number(classId),
      subject_id: Number(subjectId),
      academic_year_id: Number(academicYearId),
    };

    try {
      if (initialData) {
        await teacherAssignmentService.update(initialData.id, payload);
        toast.success("Penugasan guru berhasil diperbarui.");
      } else {
        await teacherAssignmentService.create(payload);
        toast.success("Penugasan guru berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan penugasan guru", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const teacherOptions = teachers.map((t) => ({ value: String(t.id), label: t.name }));
  const classOptions = classes.map((c) => ({ value: String(c.id), label: c.name }));
  const subjectOptions = subjects.map((s) => ({ value: String(s.id), label: s.name }));
  const yearOptions = years.map((y) => ({ value: String(y.id), label: y.name }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Penugasan Guru" : "Tambah Penugasan Guru"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="teacher-assignment-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="teacher-assignment-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField label="Guru" required error={fieldErrors.teacher_id?.[0]}>
          {teachersLoading ? (
            <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Memuat guru...
            </div>
          ) : teachersError ? (
            <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
              <span>Gagal memuat data guru.</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={loadTeachers}
                className="self-start"
              >
                Muat Ulang
              </Button>
            </div>
          ) : teachers.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
              Tidak ada guru tersedia.
            </p>
          ) : (
            <AppSelect
              value={teacherId}
              onChange={(v) => setTeacherId(v ?? "")}
              options={teacherOptions}
              placeholder="Pilih Guru"
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
              value={academicYearId}
              onChange={(v) => setAcademicYearId(v ?? "")}
              options={yearOptions}
              placeholder="Pilih Tahun Ajaran"
              isDisabled={submitting}
            />
          )}
        </FormField>
        </div>

        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}
