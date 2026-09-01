import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { violationService } from "../../api/violation.service";
import type {
  CreateViolationPayload,
  Violation,
} from "@/features/studentship/api/types";
import { studentService } from "@/features/students/api/student.service";
import type { Student } from "@/features/students/api/types";
import { teacherService } from "@/features/teachers-staff/api/teacher.service";
import { formatTeacherName, type Teacher } from "@/features/teachers-staff/api/types";

const CATEGORY_OPTIONS = [
  { value: "tatatertib", label: "Tata Tertib" },
  { value: "kehadiran", label: "Kehadiran" },
  { value: "pakaian", label: "Pakaian" },
  { value: "perilaku", label: "Perilaku" },
  { value: "akademik", label: "Akademik" },
  { value: "lainnya", label: "Lainnya" },
];

interface ViolationFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Violation | null;
}

export default function ViolationForm({
  open,
  onClose,
  onSaved,
  initialData,
}: ViolationFormProps) {
  const [studentId, setStudentId] = useState<string>("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("");
  const [violatedAt, setViolatedAt] = useState("");
  const [handledBy, setHandledBy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(false);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teachersError, setTeachersError] = useState(false);

  const isEdit = Boolean(initialData);

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

  const loadTeachers = useCallback(() => {
    setTeachersLoading(true);
    setTeachersError(false);
    teacherService
      .list({ per_page: 100 })
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
      loadStudents();
      loadTeachers();

      if (initialData) {
        setStudentId(initialData.student_id != null ? String(initialData.student_id) : "");
        setCategory(initialData.category ?? "");
        setDescription(initialData.description ?? "");
        setPoints(initialData.points != null ? String(initialData.points) : "");
        setViolatedAt(initialData.violated_at ?? "");
        setHandledBy(initialData.handled_by != null ? String(initialData.handled_by) : "");
      } else {
        setStudentId("");
        setCategory("");
        setDescription("");
        setPoints("");
        setViolatedAt("");
        setHandledBy("");
      }
    }
  }, [open, initialData, loadStudents, loadTeachers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateViolationPayload = {
      student_id: studentId ? Number(studentId) : undefined,
      category: category || undefined,
      description: description || undefined,
      points: points ? Number(points) : undefined,
      violated_at: violatedAt || undefined,
      handled_by: handledBy ? String(handledBy) : undefined,
    };

    try {
      if (initialData) {
        await violationService.update(initialData.id, payload);
        toast.success("Pelanggaran berhasil diperbarui.");
      } else {
        await violationService.create(payload);
        toast.success("Pelanggaran berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan pelanggaran", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const studentOptions = students.map((s) => ({
    value: String(s.id),
    label: s.name + (s.nisn ? ` (${s.nisn})` : ""),
  }));

  const teacherOptions = teachers.map((t) => ({
    value: String(t.id),
    label: formatTeacherName(t),
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Pelanggaran" : "Tambah Pelanggaran"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="violation-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="violation-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <FormField label="Siswa" error={fieldErrors.student_id?.[0]}>
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
              isClearable
              isDisabled={submitting}
            />
          )}
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Kategori" required error={fieldErrors.category?.[0]}>
            <AppSelect
              value={category}
              onChange={(v) => setCategory(v ?? "")}
              options={CATEGORY_OPTIONS}
              placeholder="Pilih Kategori"
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>

          <FormField label="Pointe" required error={fieldErrors.points?.[0]}>
            <Input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="Contoh: 10"
              min="0"
              max="100"
              disabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Tanggal Pelanggaran" required error={fieldErrors.violated_at?.[0]}>
            <Input
              type="date"
              value={violatedAt}
              onChange={(e) => setViolatedAt(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Ditangani Oleh" error={fieldErrors.handled_by?.[0]}>
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
                value={handledBy}
                onChange={(v) => setHandledBy(v ?? "")}
                options={teacherOptions}
                placeholder="Pilih Guru"
                isClearable
                isDisabled={submitting}
              />
            )}
          </FormField>
        </div>

        <FormField label="Deskripsi" error={fieldErrors.description?.[0]}>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Catatan detail pelanggaran..."
            disabled={submitting}
            rows={4}
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