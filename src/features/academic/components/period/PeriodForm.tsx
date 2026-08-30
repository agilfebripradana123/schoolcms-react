import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { periodService } from "../../api/period.service";
import type { CreatePeriodPayload, Period } from "../../api/types";

interface PeriodFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Period | null;
}

export default function PeriodForm({
  open,
  onClose,
  onSaved,
  initialData,
}: PeriodFormProps) {
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});

      if (initialData) {
        setName(initialData.name);
        setStartTime(initialData.start_time ?? "");
        setEndTime(initialData.end_time ?? "");
      } else {
        setName("");
        setStartTime("");
        setEndTime("");
      }
    }
  }, [open, initialData]);

  const validate = (): string | null => {
    if (!name.trim()) return "Nama jam pelajaran wajib diisi.";
    if (!startTime) return "Jam mulai wajib diisi.";
    if (!endTime) return "Jam selesai wajib diisi.";
    if (endTime <= startTime)
      return "Jam selesai harus setelah jam mulai.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const validationError = validate();
    if (validationError) {
      setError({ message: validationError });
      setSubmitting(false);
      return;
    }

    const payload: CreatePeriodPayload = {
      name: name.trim(),
      start_time: startTime,
      end_time: endTime,
    };

    try {
      if (initialData) {
        await periodService.update(initialData.id, payload);
        toast.success("Jam pelajaran berhasil diperbarui.");
      } else {
        await periodService.create(payload);
        toast.success("Jam pelajaran berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan jam pelajaran", {
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
      title={isEdit ? "Edit Jam Pelajaran" : "Tambah Jam Pelajaran"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="period-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="period-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <FormField label="Nama" required error={fieldErrors.name?.[0]}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jam ke-1"
            maxLength={50}
            disabled={submitting}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Jam Mulai"
            required
            error={fieldErrors.start_time?.[0]}
          >
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Jam Selesai"
            required
            error={fieldErrors.end_time?.[0]}
          >
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={submitting}
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