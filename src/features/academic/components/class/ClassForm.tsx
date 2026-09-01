import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { classService } from "../../api/class.service";
import type {
  CreateSchoolClassPayload,
  SchoolClass,
} from "../../api/types";
import { teacherService } from "@/features/teachers-staff/api/teacher.service";
import { formatTeacherName, type Teacher } from "@/features/teachers-staff/api/types";

interface ClassFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: SchoolClass | null;
}

export default function ClassForm({
  open,
  onClose,
  onSaved,
  initialData,
}: ClassFormProps) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teachersError, setTeachersError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadTeachers = useCallback(() => {
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

  const [previousOpen, setPreviousOpen] = useState(open);
  const [previousInitialData, setPreviousInitialData] = useState(initialData);

  if (open !== previousOpen || initialData !== previousInitialData) {
    setPreviousOpen(open);
    setPreviousInitialData(initialData);

    if (open) {
      setError(null);
      setFieldErrors({});
      setTeachersLoading(true);
      setTeachersError(false);

      if (initialData) {
        setName(initialData.name);
        setLevel(initialData.level ?? "");
        setAcademicYear(initialData.academic_year ?? "");
        setTeacherId(initialData.teacher_id != null ? String(initialData.teacher_id) : "");
      } else {
        setName("");
        setLevel("");
        setAcademicYear("");
        setTeacherId("");
      }
    }
  }

  useEffect(() => {
    if (open) {
      loadTeachers();
    }
  }, [open, loadTeachers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateSchoolClassPayload = {
      name,
      teacher_id: teacherId ? Number(teacherId) : null,
      level: level || undefined,
      academic_year: academicYear || undefined,
    };

    try {
      if (initialData) {
        await classService.update(initialData.id, payload);
        toast.success("Kelas berhasil diperbarui.");
      } else {
        await classService.create(payload);
        toast.success("Kelas berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan kelas", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const teacherOptions = teachers.map((t) => ({
    value: String(t.id),
    label: formatTeacherName(t),
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Kelas" : "Tambah Kelas"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="class-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="class-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Nama Kelas" required error={fieldErrors.name?.[0]}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="XII-A"
              maxLength={50}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Tingkat"
            hint="Opsional. Contoh: 10, 11, 12."
            error={fieldErrors.level?.[0]}
          >
            <Input
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="XI"
              maxLength={10}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField
          label="Tahun Ajaran"
          hint="Opsional. Contoh: 2025/2026."
          error={fieldErrors.academic_year?.[0]}
        >
          <Input
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="2025/2026"
            maxLength={20}
            disabled={submitting}
          />
        </FormField>

        <FormField
          label="Wali Kelas"
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
                onClick={() => {
                  setTeachersLoading(true);
                  setTeachersError(false);
                  loadTeachers();
                }}
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
              placeholder="Pilih Wali Kelas"
              isClearable
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
