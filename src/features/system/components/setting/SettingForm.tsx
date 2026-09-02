import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { settingService } from "../../api/setting.service";
import type { Setting } from "../../api/types";

interface SettingFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: (saved: Setting) => void;
  initialData?: Setting | null;
}

export default function SettingForm({
  open,
  onClose,
  onSaved,
  initialData,
}: SettingFormProps) {
  const isEdit = Boolean(initialData);

  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [previousOpen, setPreviousOpen] = useState(open);
  const [previousInitialData, setPreviousInitialData] = useState(initialData);

  if (open !== previousOpen || initialData !== previousInitialData) {
    setPreviousOpen(open);
    setPreviousInitialData(initialData);

    if (open) {
      setError(null);
      setFieldErrors({});

      if (initialData) {
        setKey(initialData.key);
        setValue(initialData.value ?? "");
        setDescription(initialData.description ?? "");
      } else {
        setKey("");
        setValue("");
        setDescription("");
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      key,
      value: value,
      description: description.trim() || null,
    };

    try {
      if (initialData) {
        await settingService.update(initialData.id, payload);
        toast.success("Pengaturan berhasil diperbarui.");
        onSaved({
          ...initialData,
          key,
          value: payload.value,
          description: payload.description,
        });
      } else {
        const res = await settingService.create(payload);
        toast.success("Pengaturan berhasil ditambahkan.");
        onSaved(res.data);
      }
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan pengaturan", {
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
      title={isEdit ? "Edit Pengaturan" : "Tambah Pengaturan"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="setting-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="setting-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <FormField
          label="Key"
          required
          error={fieldErrors.key?.[0]}
          hint={isEdit ? "Key tidak dapat diubah." : "cth. school_name"}
        >
          <Input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="cth. school_name"
            disabled={submitting || isEdit}
          />
        </FormField>

        <FormField label="Value" error={fieldErrors.value?.[0]}>
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Nilai pengaturan"
            disabled={submitting}
          />
        </FormField>

        <FormField label="Deskripsi" error={fieldErrors.description?.[0]}>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi pengaturan (opsional)"
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
