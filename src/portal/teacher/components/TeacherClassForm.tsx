import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import apiClient from "@/lib/api/axios";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";

interface TeacherClassFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: { id: number; name?: string | null; homeroom_teacher?: string | null; student_count?: number | string | null } | null;
}

export default function TeacherClassForm({ open, onClose, onSaved, initialData }: TeacherClassFormProps) {
  const isEdit = Boolean(initialData);
  const [name, setName] = useState("");
  const [homeroomTeacher, setHomeroomTeacher] = useState("");
  const [studentCount, setStudentCount] = useState("");
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
      setHomeroomTeacher(initialData?.homeroom_teacher ?? "");
      setStudentCount(initialData?.student_count != null ? String(initialData.student_count) : "");
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
      setError({ message: "Nama kelas wajib diisi." });
      setSubmitting(false);
      return;
    }

    const payload: Record<string, unknown> = { name: name.trim() };
    if (homeroomTeacher.trim()) payload.homeroom_teacher = homeroomTeacher.trim();
    if (studentCount.trim()) payload.student_count = Number(studentCount);

    try {
      if (isEdit && initialData) {
        await apiClient.put(`/teacher/classes/${initialData.id}`, payload);
        toast.success("Kelas berhasil diperbarui.");
      } else {
        await apiClient.post("/teacher/classes", payload);
        toast.success("Kelas berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) setFieldErrors(apiError.errors);
      toast.error(apiError.message || "Gagal menyimpan kelas.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Kelas" : "Tambah Kelas"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Batal</Button>
          <Button type="submit" form="teacher-class-form" loading={submitting}>Simpan</Button>
        </>
      }
    >
      <form id="teacher-class-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="Nama Kelas" required error={fieldErrors.name?.[0]}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="XII-A" disabled={submitting} />
        </FormField>
        <FormField label="Wali Kelas" error={fieldErrors.homeroom_teacher?.[0]}>
          <Input value={homeroomTeacher} onChange={(e) => setHomeroomTeacher(e.target.value)} placeholder="Nama wali kelas" disabled={submitting} />
        </FormField>
        <FormField label="Jumlah Siswa" error={fieldErrors.student_count?.[0]}>
          <Input type="number" value={studentCount} onChange={(e) => setStudentCount(e.target.value)} placeholder="0" min={0} disabled={submitting} />
        </FormField>
        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">{error.message}</p>
        )}
      </form>
    </Modal>
  );
}
