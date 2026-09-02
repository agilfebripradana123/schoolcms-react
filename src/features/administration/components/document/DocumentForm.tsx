import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { documentService } from "../../api/document.service";
import type {
  CreateDocumentPayload,
  Document,
  DocumentCategory,
} from "../../api/types";

interface DocumentFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Document | null;
}

const CategoryOptions: { value: DocumentCategory; label: string }[] = [
  { value: "sk", label: "SK" },
  { value: "peraturan", label: "Peraturan" },
  { value: "sop", label: "SOP" },
  { value: "laporan", label: "Laporan" },
  { value: "formulir", label: "Formulir" },
  { value: "lainnya", label: "Lainnya" },
];

export default function DocumentForm({
  open,
  onClose,
  onSaved,
  initialData,
}: DocumentFormProps) {
  const [title, setTitle] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("lainnya");
  const [filePath, setFilePath] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isEdit = Boolean(initialData);

  const [previousOpen, setPreviousOpen] = useState(open);
  const [previousInitialData, setPreviousInitialData] = useState(initialData);

  if (open !== previousOpen || initialData !== previousInitialData) {
    setPreviousOpen(open);
    setPreviousInitialData(initialData);

    if (open) {
      setError(null);
      setFieldErrors({});

      if (initialData) {
        setTitle(initialData.title ?? "");
        setDocumentNumber(initialData.document_number ?? "");
        setCategory(initialData.category ?? "lainnya");
        setFilePath(initialData.file_path ?? "");
        setDocumentDate(initialData.document_date ?? "");
        setDescription(initialData.description ?? "");
      } else {
        setTitle("");
        setDocumentNumber("");
        setCategory("lainnya");
        setFilePath("");
        setDocumentDate("");
        setDescription("");
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateDocumentPayload = {
      title: title.trim(),
      document_number: documentNumber.trim() || null,
      category,
      file_path: filePath.trim() || null,
      document_date: documentDate || null,
      description: description.trim() || null,
    };

    try {
      if (initialData) {
        await documentService.update(initialData.id, payload);
        toast.success("Dokumen berhasil diperbarui.");
      } else {
        await documentService.create(payload);
        toast.success("Dokumen berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan dokumen", {
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
      title={isEdit ? "Edit Dokumen" : "Tambah Dokumen"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="document-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="document-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <FormField label="Judul Dokumen" required error={fieldErrors.title?.[0]}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: SK Pembagian Tugas Mengajar 2026/2027"
            maxLength={200}
            disabled={submitting}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="Nomor Dokumen"
            hint="Opsional."
            error={fieldErrors.document_number?.[0]}
          >
            <Input
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="DOC-SK-001"
              maxLength={50}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Kategori" required error={fieldErrors.category?.[0]}>
            <AppSelect
              value={category}
              onChange={(v) => setCategory((v ?? "lainnya") as DocumentCategory)}
              options={CategoryOptions}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="Tanggal Dokumen"
            hint="Opsional."
            error={fieldErrors.document_date?.[0]}
          >
            <Input
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="File / URL"
            hint="Opsional, tautan ke berkas dokumen."
            error={fieldErrors.file_path?.[0]}
          >
            <Input
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="/uploads/dokumen/doc-sk-001.pdf"
              maxLength={255}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField
          label="Deskripsi"
          hint="Opsional."
          error={fieldErrors.description?.[0]}
        >
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi dokumen..."
            maxLength={1000}
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