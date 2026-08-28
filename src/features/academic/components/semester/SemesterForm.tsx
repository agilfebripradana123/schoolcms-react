import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { academicYearService } from "../../api/academic-year.service";
import { semesterService } from "../../api/semester.service";
import type {
  AcademicYear,
  CreateSemesterPayload,
  Semester,
} from "../../api/types";

interface SemesterFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Semester | null;
}

const SEMESTER_OPTIONS = [
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
];

export default function SemesterForm({
  open,
  onClose,
  onSaved,
  initialData,
}: SemesterFormProps) {
  const isEdit = Boolean(initialData);

  const [academicYearId, setAcademicYearId] = useState<string>("");
  const [name, setName] = useState<string>("1");
  const [isActive, setIsActive] = useState(false);

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [yearsLoading, setYearsLoading] = useState(false);
  const [yearsError, setYearsError] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

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
      loadYears();

      if (initialData) {
        setAcademicYearId(String(initialData.academic_year_id));
        setName(initialData.name);
        setIsActive(initialData.is_active ?? false);
      } else {
        setAcademicYearId("");
        setName("1");
        setIsActive(false);
      }
    }
  }, [open, initialData, loadYears]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    if (!academicYearId) {
      setError({ message: "Silakan pilih tahun ajaran." });
      setSubmitting(false);
      return;
    }

    const payload: CreateSemesterPayload = {
      academic_year_id: Number(academicYearId),
      name,
      is_active: isActive,
    };

    try {
      if (initialData) {
        await semesterService.update(initialData.id, payload);
        toast.success("Semester berhasil diperbarui.");
      } else {
        await semesterService.create(payload);
        toast.success("Semester berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan semester", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const yearOptions = years.map((y) => ({
    value: String(y.id),
    label: y.name,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Semester" : "Tambah Semester"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="semester-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="semester-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <FormField
          label="Tahun Ajaran"
          required
          error={fieldErrors.academic_year_id?.[0] ?? (error && !academicYearId ? error.message : undefined)}
        >
          {yearsLoading ? (
            <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Memuat tahun ajaran...
            </div>
          ) : yearsError ? (
            <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
              <span>Gagal memuat tahun ajaran.</span>
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
              Tidak ada tahun ajaran tersedia. Belum ada tahun ajaran, tambahkan
              melalui menu Tahun Ajaran.
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

        <FormField
          label="Semester"
          required
          error={fieldErrors.name?.[0]}
        >
          <AppSelect
            value={name}
            onChange={(v) => setName(v ?? "")}
            options={SEMESTER_OPTIONS}
            placeholder="Pilih Semester"
            isSearchable={false}
            isDisabled={submitting}
          />
        </FormField>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={submitting}
            className="h-4 w-4 rounded border-slate-300 text-primary-container focus:ring-primary-container"
          />
          <div>
            <span className="block text-sm font-semibold text-on-surface">
              Jadikan aktif
            </span>
            <span className="block text-xs text-on-surface-variant">
              Semester aktif akan digunakan sebagai semester berjalan.
            </span>
          </div>
        </label>

        {error && !error.errors && academicYearId && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}
