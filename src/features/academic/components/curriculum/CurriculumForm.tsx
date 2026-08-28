import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { curriculumService } from "../../api/curriculum.service";
import type {
  CreateCurriculumPayload,
  Curriculum,
} from "../../api/types";

interface CurriculumFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Curriculum | null;
}

export default function CurriculumForm({
  open,
  onClose,
  onSaved,
  initialData,
}: CurriculumFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description ?? "");
        setIsActive(initialData.is_active ?? false);
      } else {
        setName("");
        setDescription("");
        setIsActive(false);
      }
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateCurriculumPayload = {
      name,
      description: description || undefined,
      is_active: isActive,
    };

    try {
      if (initialData) {
        await curriculumService.update(initialData.id, payload);
        toast.success("Kurikulum berhasil diperbarui.");
      } else {
        await curriculumService.create(payload);
        toast.success("Kurikulum berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan kurikulum", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Kurikulum" : "Tambah Kurikulum"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="curriculum-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="curriculum-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <FormField label="Nama" required error={fieldErrors.name?.[0]}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kurikulum Merdeka"
            disabled={submitting}
          />
        </FormField>

        <FormField
          label="Deskripsi"
          hint="Opsional. Maksimal 255 karakter."
          error={fieldErrors.description?.[0]}
        >
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi singkat kurikulum"
            disabled={submitting}
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
              Kurikulum aktif akan digunakan sebagai kurikulum berjalan.
            </span>
          </div>
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
