import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { teacherAttendanceService } from "../api/teacher-attendance.service";
import { teacherService } from "../api/teacher.service";
import { formatTeacherName, type Teacher, type TeacherAttendance } from "../api/types";
import type { CreateTeacherAttendancePayload } from "../api/types";

interface TeacherAttendanceFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: TeacherAttendance | null;
}

const STATUS_OPTIONS = [
  { value: "hadir", label: "Hadir" },
  { value: "izin", label: "Izin" },
  { value: "sakit", label: "Sakit" },
  { value: "terlambat", label: "Terlambat" },
  { value: "alpa", label: "Alpa" },
];

export default function TeacherAttendanceForm({
  open,
  onClose,
  onSaved,
  initialData,
}: TeacherAttendanceFormProps) {
  const isEdit = Boolean(initialData);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("hadir");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (open) {
      setTeacherId(initialData?.teacher_id ? String(initialData.teacher_id) : "");
      setDate(initialData?.date ? initialData.date.substring(0, 10) : "");
      setStatus(initialData?.status ?? "hadir");
      setCheckIn(initialData?.check_in?.substring(0, 5) ?? "");
      setCheckOut(initialData?.check_out?.substring(0, 5) ?? "");
      setNotes(initialData?.notes ?? "");
      setError(null);
      setFieldErrors({});
    }
  }, [open, initialData]);

  useEffect(() => {
    if (open) {
      teacherService.list().then((res) => setTeachers(res.data)).catch(() => {
        toast.error("Gagal memuat data guru");
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    if (!teacherId) {
      setError({ message: "Guru wajib dipilih." });
      setSubmitting(false);
      return;
    }
    if (!date) {
      setError({ message: "Tanggal wajib diisi." });
      setSubmitting(false);
      return;
    }

    const payload: CreateTeacherAttendancePayload = {
      teacher_id: Number(teacherId),
      date,
      status,
      check_in: checkIn || undefined,
      check_out: checkOut || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      if (initialData) {
        await teacherAttendanceService.update(initialData.id, payload);
      } else {
        await teacherAttendanceService.create(payload);
      }
      toast.success(
        isEdit
          ? "Kehadiran guru berhasil diperbarui."
          : "Kehadiran guru berhasil ditambahkan.",
      );
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error(apiError.message || "Gagal menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Kehadiran Guru" : "Tambah Kehadiran Guru"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="attendance-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="attendance-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="Guru" required error={fieldErrors.teacher_id?.[0]}>
          <Select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            options={teachers.map((t) => ({
              value: String(t.id),
              label: formatTeacherName(t),
            }))}
            placeholder="Pilih guru"
            disabled={submitting}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Tanggal" required error={fieldErrors.date?.[0]}>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Status" required error={fieldErrors.status?.[0]}>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={STATUS_OPTIONS}
              disabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Jam Masuk" error={fieldErrors.check_in?.[0]}>
            <Input
              type="time"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Jam Pulang" error={fieldErrors.check_out?.[0]}>
            <Input
              type="time"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Catatan" error={fieldErrors.notes?.[0]}>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Surat dokter menyusul"
            disabled={submitting}
            rows={2}
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