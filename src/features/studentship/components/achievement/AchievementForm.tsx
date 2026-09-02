import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { achievementService } from "@/features/development/api/achievement.service";
import type {
  Achievement,
  CreateAchievementPayload,
} from "@/features/development/api/types";
import { studentService } from "@/features/students/api/student.service";
import type { Student } from "@/features/students/api/types";

const LEVEL_OPTIONS = [
  { value: "Sekolah", label: "Sekolah" },
  { value: "Kabupaten", label: "Kabupaten" },
  { value: "Provinsi", label: "Provinsi" },
  { value: "Nasional", label: "Nasional" },
  { value: "Internasional", label: "Internasional" },
];

interface AchievementFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Achievement | null;
}

export default function AchievementForm({
  open,
  onClose,
  onSaved,
  initialData,
}: AchievementFormProps) {
  const [studentId, setStudentId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [achievementDate, setAchievementDate] = useState("");
  const [level, setLevel] = useState("Sekolah");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(false);

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

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});
      loadStudents();

      if (initialData) {
        setStudentId(initialData.student_id != null ? String(initialData.student_id) : "");
        setTitle(initialData.title ?? "");
        setAchievementDate(initialData.achievement_date ?? "");
        setLevel(initialData.level ?? "Sekolah");
        setDescription(initialData.description ?? "");
      } else {
        setStudentId("");
        setTitle("");
        setAchievementDate("");
        setLevel("Sekolah");
        setDescription("");
      }
    }
  }, [open, initialData, loadStudents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateAchievementPayload = {
      student_id: studentId ? Number(studentId) : undefined,
      title: title || undefined,
      achievement_date: achievementDate || undefined,
      level: level || undefined,
      description: description || undefined,
    };

    try {
      if (initialData) {
        await achievementService.update(initialData.id, payload);
        toast.success("Prestasi berhasil diperbarui.");
      } else {
        await achievementService.create(payload);
        toast.success("Prestasi berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan prestasi", {
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Prestasi" : "Tambah Prestasi"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="achievement-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="achievement-form"
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
          <FormField label="Judul Prestasi" required error={fieldErrors.title?.[0]}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Juara Lomba Olahraga"
              maxLength={150}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Tanggal" required error={fieldErrors.achievement_date?.[0]}>
            <Input
              type="date"
              value={achievementDate}
              onChange={(e) => setAchievementDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Tingkat" required error={fieldErrors.level?.[0]}>
          <AppSelect
            value={level}
            onChange={(v) => setLevel(v ?? "Sekolah")}
            options={LEVEL_OPTIONS}
            isSearchable={false}
            isDisabled={submitting}
          />
        </FormField>

        <FormField label="Deskripsi" error={fieldErrors.description?.[0]}>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Catatan detail prestasi..."
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