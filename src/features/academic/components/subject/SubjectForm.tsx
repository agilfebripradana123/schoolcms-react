import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { subjectService } from "../../api/subject.service";
import type {
  CreateSubjectPayload,
  Subject,
  SubjectType,
} from "../../api/types";

interface SubjectFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Subject | null;
}

const TYPE_OPTIONS = [
  { value: "wajib", label: "Wajib" },
  { value: "pilihan", label: "Pilihan" },
];

export default function SubjectForm({
  open,
  onClose,
  onSaved,
  initialData,
}: SubjectFormProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<SubjectType>("wajib");
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
        setCode(initialData.code);
        setName(initialData.name);
        setType(initialData.type);
        setDescription(initialData.description ?? "");
      } else {
        setCode("");
        setName("");
        setType("wajib");
        setDescription("");
      }
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateSubjectPayload = {
      code,
      name,
      type,
      description: description || undefined,
    };

    try {
      if (initialData) {
        await subjectService.update(initialData.id, payload);
        toast.success("Mata pelajaran berhasil diperbarui.");
      } else {
        await subjectService.create(payload);
        toast.success("Mata pelajaran berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan mata pelajaran", {
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
      title={isEdit ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="subject-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="subject-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Kode" required error={fieldErrors.code?.[0]}>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="MTK-01"
              maxLength={20}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Tipe"
            required
            error={fieldErrors.type?.[0]}
          >
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as SubjectType)}
              options={TYPE_OPTIONS}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Nama Mata Pelajaran" required error={fieldErrors.name?.[0]}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Matematika"
            maxLength={100}
            disabled={submitting}
          />
        </FormField>

        <FormField
          label="Deskripsi"
          hint="Opsional."
          error={fieldErrors.description?.[0]}
        >
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi singkat mata pelajaran"
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
