import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { FormField, Input } from "@/components/ui/Form";
import type { ApiError } from "@/types";
import { toApiError } from "@/lib/api";
import { examSessionService } from "../../api/exam-session.service";
import type { ExamSession, CreateExamSessionPayload } from "../../api/types";

interface ExamSessionFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: ExamSession | null;
}

function toTimeInput(value?: string): string {
  if (!value) return "";
  if (value.length === 5) return value;
  return value.slice(0, 5);
}

export default function ExamSessionForm({
  open,
  onClose,
  onSaved,
  initialData,
}: ExamSessionFormProps) {
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (initialData) {
      setName(initialData.name);
      setStartTime(toTimeInput(initialData.start_time));
      setEndTime(toTimeInput(initialData.end_time));
    } else {
      setName("");
      setStartTime("");
      setEndTime("");
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: CreateExamSessionPayload = {
      name: name.trim(),
      start_time: startTime,
      end_time: endTime,
    };

    try {
      if (initialData) {
        await examSessionService.update(initialData.id, payload);
        toast.success("Sesi ujian berhasil diperbarui.");
      } else {
        await examSessionService.create(payload);
        toast.success("Sesi ujian berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      toast.error(
        initialData ? "Gagal memperbarui sesi ujian" : "Gagal menambahkan sesi ujian",
        { description: apiError.message },
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? "Edit Sesi Ujian" : "Tambah Sesi Ujian"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="exam-session-form" loading={submitting}>
            {initialData ? "Simpan" : "Tambah"}
          </Button>
        </>
      }
    >
      <form
        id="exam-session-form"
        className="space-y-5"
        onSubmit={handleSubmit}
      >
        <FormField label="Nama Sesi" required>
          <Input
            id="session-name"
            placeholder="Sesi 1, Sesi Pagi, dll."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Waktu Mulai" required>
            <input
              id="start-time"
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-xl border border-on-surface-variant/30 bg-white px-3 py-2 text-sm text-on-surface shadow-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>

          <FormField label="Waktu Selesai" required>
            <input
              id="end-time"
              type="time"
              required
              value={endTime}
              min={startTime || undefined}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-xl border border-on-surface-variant/30 bg-white px-3 py-2 text-sm text-on-surface shadow-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>
        </div>

        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}
