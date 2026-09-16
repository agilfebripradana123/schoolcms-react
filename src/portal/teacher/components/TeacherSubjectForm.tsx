import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import apiClient from "@/lib/api/axios";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";

interface TeacherSubjectFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: { id: number; name?: string | null; code?: string | null; category?: string | null } | null;
}

export default function TeacherSubjectForm({ open, onClose, onSaved, initialData }: TeacherSubjectFormProps) {
  const isEdit = Boolean(initialData);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevData, setPrevData] = useState(initialData);

  if (open !== prevOpen || initialData !== prevData) {
    setPrevOpen(open);
    setPrevData(initialData);
    if (open) {
      setName(initialData?.name ?? "");
      setCode(initialData?.code ?? "");
      setCategory(initialData?.category ?? "");
      setError(null);
      setFieldErrors({});
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    if (!name.trim()) {
      setError({ message: "Nama mata pelajaran wajib diisi." });
      setSubmitting(false);
      return;
    }

    const payload: Record<string, unknown> = { name: name.trim() };
    if (code.trim()) payload.code = code.trim();
    if (category.trim()) payload.category = category.trim();

    try {
      if (isEdit && initialData) {
        await apiClient.put(`/teacher/subjects/${initialData.id}`, payload);
        toast.success("Mata pelajaran berhasil diperbarui.");
      } else {
        await apiClient.post("/teacher/subjects", payload);
        toast.success("Mata pelajaran berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) setFieldErrors(apiError.errors);
      toast.error(apiError.message || "Gagal menyimpan mata pelajaran.");
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
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Batal</Button>
          <Button type="submit" form="teacher-subject-form" loading={submitting}>Simpan</Button>
        </>
      }
    >
      <form id="teacher-subject-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="Nama Mata Pelajaran" required error={fieldErrors.name?.[0]}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Matematika" disabled={submitting} />
        </FormField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Kode" error={fieldErrors.code?.[0]}>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="MTK" disabled={submitting} />
          </FormField>
          <FormField label="Kategori" error={fieldErrors.category?.[0]}>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Wajib / Pilihan" disabled={submitting} />
          </FormField>
        </div>
        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">{error.message}</p>
        )}
      </form>
    </Modal>
  );
}
