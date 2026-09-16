import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import apiClient from "@/lib/api/axios";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";

interface TeacherStudentFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: { id: number; nis?: string | null; name: string; email?: string | null; class?: string | null } | null;
}

export default function TeacherStudentForm({ open, onClose, onSaved, initialData }: TeacherStudentFormProps) {
  const isEdit = Boolean(initialData);
  const [nis, setNis] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cls, setCls] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevData, setPrevData] = useState(initialData);

  if (open !== prevOpen || initialData !== prevData) {
    setPrevOpen(open);
    setPrevData(initialData);
    if (open) {
      setNis(initialData?.nis ?? "");
      setName(initialData?.name ?? "");
      setEmail(initialData?.email ?? "");
      setCls(initialData?.class ?? "");
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

    const payload: Record<string, unknown> = { name: name.trim() };
    if (nis.trim()) payload.nis = nis.trim();
    if (email.trim()) payload.email = email.trim();
    if (cls.trim()) payload.class = cls.trim();

    try {
      if (isEdit && initialData) {
        await apiClient.put(`/teacher/students/${initialData.id}`, payload);
        toast.success("Data siswa berhasil diperbarui.");
      } else {
        await apiClient.post("/teacher/students", payload);
        toast.success("Data siswa berhasil ditambahkan.");
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
      title={isEdit ? "Edit Siswa" : "Tambah Siswa"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Batal</Button>
          <Button type="submit" form="teacher-student-form" loading={submitting}>Simpan</Button>
        </>
      }
    >
      <form id="teacher-student-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="NIS" error={fieldErrors.nis?.[0]}>
            <Input value={nis} onChange={(e) => setNis(e.target.value)} placeholder="NIS" disabled={submitting} />
          </FormField>
          <FormField label="Kelas" error={fieldErrors.class?.[0]}>
            <Input value={cls} onChange={(e) => setCls(e.target.value)} placeholder="XII-A" disabled={submitting} />
          </FormField>
        </div>
        <FormField label="Nama Lengkap" required error={fieldErrors.name?.[0]}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" disabled={submitting} />
        </FormField>
        <FormField label="Email" error={fieldErrors.email?.[0]}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@sekolah.sch.id" disabled={submitting} />
        </FormField>
        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">{error.message}</p>
        )}
      </form>
    </Modal>
  );
}
