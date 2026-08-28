import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Select } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { classSubjectService } from "../../api/class-subject.service";
import { classService } from "../../api/class.service";
import { subjectService } from "../../api/subject.service";
import { teacherService } from "@/features/teachers-staff/api/teacher.service";
import { formatTeacherName, type Teacher } from "@/features/teachers-staff/api/types";
import type {
  ClassSubject,
  CreateClassSubjectPayload,
  SchoolClass,
  Subject,
} from "../../api/types";

interface ClassSubjectFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: ClassSubject | null;
}

export default function ClassSubjectForm({
  open,
  onClose,
  onSaved,
  initialData,
}: ClassSubjectFormProps) {
  const [classId, setClassId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [classesError, setClassesError] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState(false);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teachersError, setTeachersError] = useState(false);

  const isEdit = Boolean(initialData);

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

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});
      loadClasses();
      loadSubjects();
      loadTeachers();

      if (initialData) {
        setClassId(String(initialData.class_id));
        setSubjectId(String(initialData.subject_id));
        setTeacherId(
          initialData.teacher_id != null ? String(initialData.teacher_id) : "",
        );
      } else {
        setClassId("");
        setSubjectId("");
        setTeacherId("");
      }
    }
  }, [open, initialData, loadClasses, loadSubjects, loadTeachers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateClassSubjectPayload = {
      class_id: Number(classId),
      subject_id: Number(subjectId),
      teacher_id: teacherId ? Number(teacherId) : null,
    };

    try {
      if (initialData) {
        await classSubjectService.update(initialData.id, payload);
        toast.success("Mata pelajaran kelas berhasil diperbarui.");
      } else {
        await classSubjectService.create(payload);
        toast.success("Mata pelajaran kelas berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan mata pelajaran kelas", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const classOptions = classes.map((c) => ({ value: String(c.id), label: c.name }));
  const subjectOptions = subjects.map((s) => ({ value: String(s.id), label: s.name }));
  const teacherOptions = teachers.map((t) => ({ value: String(t.id), label: formatTeacherName(t) }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Mata Pelajaran Kelas" : "Tambah Mata Pelajaran Kelas"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="class-subject-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="class-subject-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
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
            <Select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              options={classOptions}
              placeholder="Pilih Kelas"
              disabled={submitting}
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
            <Select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              options={subjectOptions}
              placeholder="Pilih Mata Pelajaran"
              disabled={submitting}
            />
          )}
        </FormField>

        <FormField
          label="Guru"
          hint="Opsional."
          error={fieldErrors.teacher_id?.[0]}
        >
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
            <Select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              options={teacherOptions}
              placeholder="Pilih Guru"
              disabled={submitting}
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
