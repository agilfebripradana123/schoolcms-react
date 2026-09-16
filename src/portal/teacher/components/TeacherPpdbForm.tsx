import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import apiClient from "@/lib/api/axios";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";

interface TeacherPpdbFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: { id: number; name?: string | null; email?: string | null; status?: string | null; registration_date?: string | null } | null;
}

export default function TeacherPpdbForm({ open, onClose, onSaved, initialData }: TeacherPpdbFormProps) {
  const isEdit = Boolean(initialData);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");
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
      setEmail(initialData?.email ?? "");
      setStatus(initialData?.status ?? "");
      setRegistrationDate(initialData?.registration_date ?? "");
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
      setError({ message: "Nama pendaftar wajib diisi." });
      setSubmitting(false);
      return;
    }

    const payload: Record<string, unknown> = { name: name.trim() };
    if (email.trim()) payload.email = email.trim();
    if (status.trim()) payload.status = status.trim();
    if (registrationDate.trim()) payload.registration_date = registrationDate.trim();

    try {
      if (isEdit && initialData) {
        await apiClient.put(`/teacher/ppdb/registrations/${initialData.id}`, payload);
        toast.success("Data pendaftar berhasil diperbarui.");
      } else {
        await apiClient.post("/teacher/ppdb/registrations", payload);
        toast.success("Data pendaftar berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) setFieldErrors(apiError.errors);
      toast.error(apiError.message || "Gagal menyimpan data pendaftar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Pendaftar PPDB" : "Tambah Pendaftar PPDB"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Batal</Button>
          <Button type="submit" form="teacher-ppdb-form" loading={submitting}>Simpan</Button>
        </>
      }
    >
      <form id="teacher-ppdb-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="Nama Lengkap" required error={fieldErrors.name?.[0]}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama pendaftar" disabled={submitting} />
        </FormField>
        <FormField label="Email" error={fieldErrors.email?.[0]}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" disabled={submitting} />
        </FormField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Status" error={fieldErrors.status?.[0]}>
            <Input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Diterima / Ditolak / Menunggu" disabled={submitting} />
          </FormField>
          <FormField label="Tanggal Daftar" error={fieldErrors.registration_date?.[0]}>
            <Input type="date" value={registrationDate} onChange={(e) => setRegistrationDate(e.target.value)} disabled={submitting} />
          </FormField>
        </div>
        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">{error.message}</p>
        )}
      </form>
    </Modal>
  );
}
