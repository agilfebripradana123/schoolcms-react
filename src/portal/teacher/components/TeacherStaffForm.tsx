import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import apiClient from "@/lib/api/axios";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";

interface TeacherStaffFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: { id: number; nip?: string | null; name: string; email: string; status?: string | null } | null;
}

export default function TeacherStaffForm({ open, onClose, onSaved, initialData }: TeacherStaffFormProps) {
  const isEdit = Boolean(initialData);
  const [nip, setNip] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevData, setPrevData] = useState(initialData);

  if (open !== prevOpen || initialData !== prevData) {
    setPrevOpen(open);
    setPrevData(initialData);
    if (open) {
      setNip(initialData?.nip ?? "");
      setName(initialData?.name ?? "");
      setEmail(initialData?.email ?? "");
      setStatus(initialData?.status ?? "");
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
      setError({ message: "Nama wajib diisi." });
      setSubmitting(false);
      return;
    }

    const payload: Record<string, unknown> = { name: name.trim(), email: email.trim() };
    if (nip.trim()) payload.nip = nip.trim();
    if (status.trim()) payload.status = status.trim();

    try {
      if (isEdit && initialData) {
        await apiClient.put(`/teacher/staff/${initialData.id}`, payload);
        toast.success("Data staf berhasil diperbarui.");
      } else {
        await apiClient.post("/teacher/staff", payload);
        toast.success("Data staf berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) setFieldErrors(apiError.errors);
      toast.error(apiError.message || "Gagal menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Staf" : "Tambah Staf"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Batal</Button>
          <Button type="submit" form="teacher-staff-form" loading={submitting}>Simpan</Button>
        </>
      }
    >
      <form id="teacher-staff-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="NIP" error={fieldErrors.nip?.[0]}>
            <Input value={nip} onChange={(e) => setNip(e.target.value)} placeholder="NIP" disabled={submitting} />
          </FormField>
          <FormField label="Status" error={fieldErrors.status?.[0]}>
            <Input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Aktif / Nonaktif" disabled={submitting} />
          </FormField>
        </div>
        <FormField label="Nama Lengkap" required error={fieldErrors.name?.[0]}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" disabled={submitting} />
        </FormField>
        <FormField label="Email" required error={fieldErrors.email?.[0]}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@sekolah.sch.id" disabled={submitting} />
        </FormField>
        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">{error.message}</p>
        )}
      </form>
    </Modal>
  );
}
