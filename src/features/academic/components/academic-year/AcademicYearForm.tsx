import { useEffect, useState } from "react";
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
  onSaved: () => void;
  initialData?: AcademicYear | null;
}

export default function AcademicYearForm({
  open,
  onClose,
  onSaved,
  initialData,
}: AcademicYearFormProps) {
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setIsActive(initialData?.is_active ?? false);
      setError(null);
      setFieldErrors({});
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateAcademicYearPayload = {
      name: name.trim(),
      is_active: isActive,
    };

    try {
      if (initialData) {
        await academicYearService.update(initialData.id, payload);
      } else {
        await academicYearService.create(payload);
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
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
        className="space-y-4"
        noValidate
      >
        <FormField
          label="Nama Tahun Ajaran"
          required
          error={fieldErrors.name?.[0]}
          hint="Contoh: 2025/2026"
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="2025/2026"
            disabled={submitting}
            maxLength={20}
          />
        </FormField>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={submitting}
            className="h-4 w-4 rounded border-slate-300 text-primary-container focus:ring-primary-container"
          />
          <span className="text-sm font-medium text-on-surface">
            Aktif
          </span>
        </label>

        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}
