import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { extracurricularService } from "../../api/extracurricular.service";
import type {
  CreateExtracurricularPayload,
  Extracurricular,
} from "../../api/types";
import { formatSupervisor } from "../../api/types";

interface ExtracurricularFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Extracurricular | null;
}

export default function ExtracurricularForm({
  open,
  onClose,
  onSaved,
  initialData,
}: ExtracurricularFormProps) {
  const [name, setName] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});

      if (initialData) {
        setName(initialData.name ?? "");
        setSupervisor(formatSupervisor(initialData.supervisor));
        setDescription(initialData.description ?? "");
      } else {
        setName("");
        setSupervisor("");
        setDescription("");
      }
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateExtracurricularPayload = {
      name: name || undefined,
      supervisor: supervisor || undefined,
      description: description || undefined,
    };

    try {
      if (initialData) {
        await extracurricularService.update(initialData.id, payload);
        toast.success("Ekstrakurikuler berhasil diperbarui.");
      } else {
        await extracurricularService.create(payload);
        toast.success("Ekstrakurikuler berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan ekstrakurikuler", {
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
      title={isEdit ? "Edit Ekstrakurikuler" : "Tambah Ekstrakurikuler"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="extracurricular-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="extracurricular-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <FormField label="Nama Ekstrakurikuler" required error={fieldErrors.name?.[0]}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Pramuka"
            maxLength={100}
            disabled={submitting}
          />
        </FormField>

        <FormField label="Pembina" error={fieldErrors.supervisor?.[0]}>
          <Input
            value={supervisor}
            onChange={(e) => setSupervisor(e.target.value)}
            placeholder="Nama pembina"
            maxLength={100}
            disabled={submitting}
          />
        </FormField>

        <FormField label="Deskripsi" error={fieldErrors.description?.[0]}>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi kegiatan..."
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