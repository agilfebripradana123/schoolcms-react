import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { academicYearService } from "../../api/academic-year.service";
import type {
  AcademicYear,
  CreateAcademicYearPayload,
} from "../../api/types";

interface AcademicYearFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: (saved: AcademicYear) => void;
  initialData?: AcademicYear | null;
}

export default function AcademicYearForm({
  open,
  onClose,
  onSaved,
  initialData,
}: AcademicYearFormProps) {
  const [startYear, setStartYear] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return String(month >= 6 ? year : year - 1);
  });
  const [isActive, setIsActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isEdit = Boolean(initialData);

  // Tahun selesai selalu = tahun mulai + 1
  const startNum = parseInt(startYear, 10);
  const endYear = isNaN(startNum) ? "" : String(startNum + 1);

  useEffect(() => {
    if (open && initialData) {
      const parts = initialData.name.split("/");
      if (parts.length === 2 && parts[0]) {
        setStartYear(parts[0]);
      }
      setIsActive(initialData.is_active ?? false);
      setError(null);
      setFieldErrors({});
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    if (!/^\d{4}$/.test(startYear)) {
      setError({
        message: "Tahun mulai harus 4 digit angka, contoh: 2031",
      });
      setSubmitting(false);
      return;
    }

    const payload: CreateAcademicYearPayload = {
      name: `${startYear}/${endYear}`,
      is_active: isActive,
    };

    try {
      if (initialData) {
        await academicYearService.update(initialData.id, payload);
        toast.success("Tahun ajaran berhasil diperbarui.");
        onSaved({ ...initialData, name: payload.name, is_active: isActive });
      } else {
        const res = await academicYearService.create(payload);
        toast.success("Tahun ajaran berhasil ditambahkan.");
        onSaved(res.data);
      }
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }

      const msg = (apiError.message ?? "").toLowerCase();
      const isDuplicate =
        msg.includes("sudah") ||
        msg.includes("exists") ||
        msg.includes("duplicate") ||
        msg.includes("unique") ||
        msg.includes("terdaftar") ||
        msg.includes("digunakan") ||
        msg.includes("validation") ||
        msg.includes("failed");

      toast.error(
        isDuplicate
          ? `Tahun ajaran ${startYear}/${endYear} sudah ada`
          : "Gagal menyimpan",
        {
          description: isDuplicate
            ? "Silakan pilih tahun mulai lain yang belum terdaftar."
            : apiError.message,
        },
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button
            type="submit"
            form="academic-year-form"
            loading={submitting}
          >
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="academic-year-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        {isEdit ? (
          <>
            <FormField label="Tahun Ajaran">
              <Input
                value={`${startYear}/${endYear}`}
                readOnly
                className="bg-slate-50"
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
                  Tahun ajaran aktif akan otomatis menggantikan status aktif lainnya.
                </span>
              </div>
            </label>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Tahun Mulai"
                required
                error={fieldErrors.startYear?.[0]}
              >
                <Input
                  type="number"
                  inputMode="numeric"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  placeholder="2031"
                  disabled={submitting}
                />
              </FormField>

              <FormField
                label="Tahun Selesai"
                required
                error={fieldErrors.endYear?.[0]}
              >
                <Input
                  value={endYear}
                  readOnly
                  placeholder="2032"
                  className="bg-slate-50"
                />
              </FormField>
            </div>

            <p className="text-xs text-on-surface-variant">
              Tahun selesai otomatis diisi 1 tahun lebih besar dari tahun mulai.
            </p>

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
                  Tahun ajaran aktif akan otomatis menggantikan status aktif lainnya.
                </span>
              </div>
            </label>
          </>
        )}

        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}