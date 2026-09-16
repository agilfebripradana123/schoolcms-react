import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import apiClient from "@/lib/api/axios";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";

interface TeacherAcademicYearFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: { id: number; year?: string | null; semester?: string | null; status?: string | null } | null;
}

export default function TeacherAcademicYearForm({ open, onClose, onSaved, initialData }: TeacherAcademicYearFormProps) {
  const isEdit = Boolean(initialData);
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
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
      setYear(initialData?.year ?? "");
      setSemester(initialData?.semester ?? "");
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

    if (!year.trim()) {
      setError({ message: "Tahun ajaran wajib diisi." });
      setSubmitting(false);
      return;
    }

    const payload: Record<string, unknown> = { year: year.trim() };
    if (semester.trim()) payload.semester = semester.trim();
    if (status.trim()) payload.status = status.trim();

    try {
      if (isEdit && initialData) {
        await apiClient.put(`/teacher/academic-years/${initialData.id}`, payload);
        toast.success("Tahun ajaran berhasil diperbarui.");
      } else {
        await apiClient.post("/teacher/academic-years", payload);
        toast.success("Tahun ajaran berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) setFieldErrors(apiError.errors);
      toast.error(apiError.message || "Gagal menyimpan tahun ajaran.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Batal</Button>
          <Button type="submit" form="teacher-academic-year-form" loading={submitting}>Simpan</Button>
        </>
      }
    >
      <form id="teacher-academic-year-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="Tahun Ajaran" required error={fieldErrors.year?.[0]}>
          <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2025/2026" disabled={submitting} />
        </FormField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Semester" error={fieldErrors.semester?.[0]}>
            <Input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="Ganjil / Genap" disabled={submitting} />
          </FormField>
          <FormField label="Status" error={fieldErrors.status?.[0]}>
            <Input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Aktif / Nonaktif" disabled={submitting} />
          </FormField>
        </div>
        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">{error.message}</p>
        )}
      </form>
    </Modal>
  );
}
