import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import apiClient from "@/lib/api/axios";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";

interface TeacherScheduleFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: { id: number; day?: string | null; time?: string | null; class?: string | null; subject?: string | null } | null;
}

export default function TeacherScheduleForm({ open, onClose, onSaved, initialData }: TeacherScheduleFormProps) {
  const isEdit = Boolean(initialData);
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [cls, setCls] = useState("");
  const [subject, setSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevData, setPrevData] = useState(initialData);

  if (open !== prevOpen || initialData !== prevData) {
    setPrevOpen(open);
    setPrevData(initialData);
    if (open) {
      setDay(initialData?.day ?? "");
      setTime(initialData?.time ?? "");
      setCls(initialData?.class ?? "");
      setSubject(initialData?.subject ?? "");
      setError(null);
      setFieldErrors({});
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    if (!day.trim() || !time.trim()) {
      setError({ message: "Hari dan jam wajib diisi." });
      setSubmitting(false);
      return;
    }

    const payload: Record<string, unknown> = { day: day.trim(), time: time.trim() };
    if (cls.trim()) payload.class = cls.trim();
    if (subject.trim()) payload.subject = subject.trim();

    try {
      if (isEdit && initialData) {
        await apiClient.put(`/teacher/schedules/${initialData.id}`, payload);
        toast.success("Jadwal berhasil diperbarui.");
      } else {
        await apiClient.post("/teacher/schedules", payload);
        toast.success("Jadwal berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) setFieldErrors(apiError.errors);
      toast.error(apiError.message || "Gagal menyimpan jadwal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Jadwal" : "Tambah Jadwal"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Batal</Button>
          <Button type="submit" form="teacher-schedule-form" loading={submitting}>Simpan</Button>
        </>
      }
    >
      <form id="teacher-schedule-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Hari" required error={fieldErrors.day?.[0]}>
            <Input value={day} onChange={(e) => setDay(e.target.value)} placeholder="Senin" disabled={submitting} />
          </FormField>
          <FormField label="Jam" required error={fieldErrors.time?.[0]}>
            <Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="08:00 - 09:30" disabled={submitting} />
          </FormField>
        </div>
        <FormField label="Kelas" error={fieldErrors.class?.[0]}>
          <Input value={cls} onChange={(e) => setCls(e.target.value)} placeholder="XII-A" disabled={submitting} />
        </FormField>
        <FormField label="Mata Pelajaran" error={fieldErrors.subject?.[0]}>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Matematika" disabled={submitting} />
        </FormField>
        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">{error.message}</p>
        )}
      </form>
    </Modal>
  );
}
