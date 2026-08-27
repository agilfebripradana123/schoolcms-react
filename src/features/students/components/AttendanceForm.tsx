import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { attendanceService } from "../api/attendance.service";
import { studentService } from "../api/student.service";
import { classService } from "@/features/academic/api/class.service";
import { academicYearService } from "@/features/academic/api/academic-year.service";
import { classStudentService } from "@/features/academic/api/class-student.service";
import type { Attendance, CreateAttendancePayload, Student, SchoolClassLike } from "../api/types";

interface AttendanceFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Attendance | null;
}

const STATUS_OPTIONS = [
  { value: "hadir", label: "Hadir" },
  { value: "sakit", label: "Sakit" },
  { value: "izin", label: "Izin" },
  { value: "alpa", label: "Alpa" },
];

export default function AttendanceForm({
  open,
  onClose,
  onSaved,
  initialData,
}: AttendanceFormProps) {
  const isEdit = Boolean(initialData);

  const [studentId, setStudentId] = useState<number | "">("");
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClassLike[]>([]);
  const [classId, setClassId] = useState<number | "">("");
  const [classAuto, setClassAuto] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [status, setStatus] = useState("hadir");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

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
    }
  }, [open, isEdit]);

  const studentOptions = useMemo(
    () =>
      [...students]
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "id"))
        .map((s) => ({
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

  useEffect(() => {
    if (open) {
      setStudentId(initialData?.student_id ?? "");
      setClassId(initialData?.class_id ?? "");
      setClassAuto(Boolean(initialData));
      setDate(initialData?.date ? initialData.date.substring(0, 10) : new Date().toISOString().substring(0, 10));
      setStatus(initialData?.status ?? "hadir");
      setNote(initialData?.note ?? "");
      setError(null);
      setFieldErrors({});
    }
  }, [open, initialData]);

  // Isi kelas otomatis dari class_students (sumber kelas resmi per tahun ajaran)
  useEffect(() => {
    if (!open || isEdit || !studentId) return;

    let active = true;
    setClassId("");
    setClassAuto(false);

    (async () => {
      let yearId: number | undefined;
      try {
        const yearRes = await academicYearService.list({ is_active: true });
        yearId = yearRes.data?.[0]?.id;
      } catch {
        yearId = undefined;
      }

      const params: { student_id: number; academic_year_id?: number; per_page: number } = {
        student_id: Number(studentId),
        per_page: 1,
      };
      if (yearId) params.academic_year_id = yearId;

      try {
        const res = await classStudentService.list(params);
        const first = res.data?.[0];
        if (active && first?.class_id) {
          setClassId(first.class_id);
          setClassAuto(true);
        }
      } catch {
        // siswa belum punya pivot class_students -> dropdown manual sebagai fallback
      }
    })();

    return () => {
      active = false;
    };
  }, [open, isEdit, studentId]);

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

    const payload: CreateAttendancePayload = {
      student_id: Number(studentId),
      class_id: classId ? Number(classId) : undefined,
      date,
      status,
      note: note.trim() || undefined,
    };

    try {
      if (initialData) {
        await attendanceService.update(initialData.id, payload);
        toast.success("Kehadiran berhasil diperbarui.");
      } else {
        await attendanceService.create(payload);
        toast.success("Kehadiran berhasil dicatat.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error(apiError.message || "Gagal menyimpan kehadiran.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Kehadiran" : "Catat Kehadiran"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="attendance-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="attendance-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
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
          <FormField
            label="Kelas"
            hint={classAuto ? "Diisi otomatis dari penempatan kelas siswa" : "Pilih kelas (jika siswa belum ditempatkan)"}
            error={fieldErrors.class_id?.[0]}
          >
            <Select
              value={classId}
              onChange={(e) => setClassId(e.target.value ? Number(e.target.value) : "")}
              options={classOptions}
              placeholder="Pilih kelas"
              disabled={submitting || classAuto}
            />
          </FormField>

          <FormField label="Tanggal" required error={fieldErrors.date?.[0]}>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Status" required error={fieldErrors.status?.[0]}>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_OPTIONS}
            disabled={submitting}
          />
        </FormField>

        <FormField label="Catatan" error={fieldErrors.note?.[0]}>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Sakit demam, izin keluarga, dst."
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