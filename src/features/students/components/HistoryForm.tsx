import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Select, Textarea } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { studentHistoryService } from "../api/student-history.service";
import { studentService } from "../api/student.service";
import type { CreateStudentHistoryPayload, SchoolClassLike, Student, StudentHistory } from "../api/types";
import { classService } from "@/features/academic/api/class.service";
import { academicYearService } from "@/features/academic/api/academic-year.service";

interface HistoryFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: StudentHistory | null;
}

export default function HistoryForm({
  open,
  onClose,
  onSaved,
  initialData,
}: HistoryFormProps) {
  const isEdit = Boolean(initialData);

  const [studentId, setStudentId] = useState<number | "">("");
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClassLike[]>([]);
  const [academicYears, setAcademicYears] = useState<{ id: number; name: string }[]>([]);
  const [classId, setClassId] = useState<number | "">("");
  const [academicYearId, setAcademicYearId] = useState<number | "">("");
  const [status, setStatus] = useState("naik");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [previousOpen, setPreviousOpen] = useState(open);
  const [previousInitialData, setPreviousInitialData] = useState(initialData);

  if (open !== previousOpen || initialData !== previousInitialData) {
    setPreviousOpen(open);
    setPreviousInitialData(initialData);

    if (open) {
      setStudentId(initialData?.student_id ?? "");
      setClassId(initialData?.class_id ?? "");
      setAcademicYearId(initialData?.academic_year_id ?? "");
      setStatus(initialData?.status ?? "naik");
      setNotes(initialData?.notes ?? "");
      setError(null);
      setFieldErrors({});
    }
  }

  useEffect(() => {
    if (open) {
      if (!isEdit) {
        studentService
          .list()
          .then((res) => setStudents(res.data))
          .catch(() => setStudents([]));
      }
      classService
        .list()
        .then((res) => setClasses(res.data))
        .catch(() => setClasses([]));
      academicYearService
        .list()
        .then((res) => setAcademicYears(res.data))
        .catch(() => setAcademicYears([]));
    }
  }, [open, isEdit]);

  const studentOptions = useMemo(
    () =>
      students.map((s) => ({
        value: String(s.id),
        label: `${s.name} (${s.nisn || s.nis})`,
      })),
    [students],
  );

  const classOptions = useMemo(
    () =>
      classes.map((c) => ({
        value: String(c.id),
        label: c.name,
      })),
    [classes],
  );

  const yearOptions = useMemo(
    () =>
      academicYears.map((y) => ({
        value: String(y.id),
        label: y.name,
      })),
    [academicYears],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    if (!studentId) {
      setError({ message: "Pilih siswa terlebih dahulu." });
      setSubmitting(false);
      return;
    }

    const payload: CreateStudentHistoryPayload = {
      student_id: Number(studentId),
      class_id: classId ? Number(classId) : undefined,
      academic_year_id: academicYearId ? Number(academicYearId) : undefined,
      status: status.trim(),
      notes: notes.trim() || undefined,
    };

    try {
      if (initialData) {
        await studentHistoryService.update(initialData.id, payload);
        toast.success("Riwayat siswa berhasil diperbarui.");
      } else {
        await studentHistoryService.create(payload);
        toast.success("Riwayat siswa berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error(apiError.message || "Gagal menyimpan riwayat siswa.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Riwayat Siswa" : "Tambah Riwayat Siswa"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="history-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="history-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {initialData?.student ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
            Siswa: <span className="font-semibold text-on-surface">{initialData.student.name}</span>
            {" · "}
            {initialData.student.nisn}
          </div>
        ) : (
          <FormField label="Pilih Siswa" required error={fieldErrors.student_id?.[0]}>
            <Select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value ? Number(e.target.value) : "")}
              options={studentOptions}
              placeholder="Pilih siswa"
              disabled={submitting}
            />
          </FormField>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Kelas" error={fieldErrors.class_id?.[0]}>
            <Select
              value={classId}
              onChange={(e) => setClassId(e.target.value ? Number(e.target.value) : "")}
              options={classOptions}
              placeholder="Pilih kelas"
              disabled={submitting}
            />
          </FormField>

          <FormField label="Tahun Ajaran" error={fieldErrors.academic_year_id?.[0]}>
            <Select
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value ? Number(e.target.value) : "")}
              options={yearOptions}
              placeholder="Pilih tahun ajaran"
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Status" required error={fieldErrors.status?.[0]}>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "naik", label: "Naik Kelas" },
              { value: "tinggal", label: "Tinggal Kelas" },
              { value: "mutasi_masuk", label: "Mutasi Masuk" },
              { value: "mutasi_keluar", label: "Mutasi Keluar" },
            ]}
            disabled={submitting}
          />
        </FormField>

        <FormField label="Catatan" error={fieldErrors.notes?.[0]}>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Naik kelas dengan nilai baik."
            disabled={submitting}
            rows={3}
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