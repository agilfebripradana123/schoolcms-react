import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Select } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { classStudentService } from "../../api/class-student.service";
import { classService } from "../../api/class.service";
import { academicYearService } from "../../api/academic-year.service";
import { studentService } from "@/features/students/api/student.service";
import type {
  AcademicYear,
  ClassStudent,
  ClassStudentStatus,
  CreateClassStudentPayload,
  SchoolClass,
} from "../../api/types";
import type { Student } from "@/features/students/api/types";

interface ClassStudentFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: ClassStudent | null;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Aktif" },
  { value: "moved", label: "Pindah" },
  { value: "graduated", label: "Lulus" },
];

export default function ClassStudentForm({
  open,
  onClose,
  onSaved,
  initialData,
}: ClassStudentFormProps) {
  const [classId, setClassId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [academicYearId, setAcademicYearId] = useState<string>("");
  const [status, setStatus] = useState<ClassStudentStatus>("active");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [classesError, setClassesError] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(false);

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [yearsLoading, setYearsLoading] = useState(false);
  const [yearsError, setYearsError] = useState(false);

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

  const loadStudents = useCallback(() => {
    setStudentsLoading(true);
    setStudentsError(false);
    studentService
      .list({ per_page: 100 })
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
      loadClasses();
      loadStudents();
      loadYears();

      if (initialData) {
        setClassId(String(initialData.class_id));
        setStudentId(String(initialData.student_id));
        setAcademicYearId(String(initialData.academic_year_id));
        setStatus(initialData.status);
      } else {
        setClassId("");
        setStudentId("");
        setAcademicYearId("");
        setStatus("active");
      }
    }
  }, [open, initialData, loadClasses, loadStudents, loadYears]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateClassStudentPayload = {
      class_id: Number(classId),
      student_id: Number(studentId),
      academic_year_id: Number(academicYearId),
      status,
    };

    try {
      if (initialData) {
        await classStudentService.update(initialData.id, payload);
        toast.success("Data siswa kelas berhasil diperbarui.");
      } else {
        await classStudentService.create(payload);
        toast.success("Data siswa berhasil ditambahkan ke kelas.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan data siswa kelas", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const classOptions = classes.map((c) => ({ value: String(c.id), label: c.name }));
  const studentOptions = students.map((s) => ({ value: String(s.id), label: s.name }));
  const yearOptions = years.map((y) => ({ value: String(y.id), label: y.name }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Siswa Kelas" : "Tambah Siswa Kelas"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="class-student-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="class-student-form"
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
            <Select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              options={studentOptions}
              placeholder="Pilih Siswa"
              disabled={submitting}
            />
          )}
        </FormField>

        <FormField
          label="Tahun Ajaran"
          required
          error={fieldErrors.academic_year_id?.[0]}
        >
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
            <Select
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              options={yearOptions}
              placeholder="Pilih Tahun Ajaran"
              disabled={submitting}
            />
          )}
        </FormField>

        <FormField label="Status" required error={fieldErrors.status?.[0]}>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as ClassStudentStatus)}
            options={STATUS_OPTIONS}
            disabled={submitting}
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
