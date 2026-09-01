import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { teacherLeaveService } from "../api/teacher-leave.service";
import { teacherService } from "../api/teacher.service";
import { formatTeacherName, type CreateTeacherLeavePayload, type Teacher, type TeacherLeave } from "../api/types";

interface TeacherLeaveFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: TeacherLeave | null;
}

const LEAVE_TYPE_OPTIONS = [
  { value: "izin", label: "Izin" },
  { value: "sakit", label: "Sakit" },
  { value: "cuti", label: "Cuti" },
  { value: "dinas", label: "Dinas" },
];

const STATUS_OPTIONS = [
  { value: "menunggu", label: "Menunggu" },
  { value: "disetujui", label: "Disetujui" },
  { value: "ditolak", label: "Ditolak" },
];

export default function TeacherLeaveForm({
  open,
  onClose,
  onSaved,
  initialData,
}: TeacherLeaveFormProps) {
  const isEdit = Boolean(initialData);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [leaveType, setLeaveType] = useState("izin");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("menunggu");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [previousOpen, setPreviousOpen] = useState(open);
  const [previousInitialData, setPreviousInitialData] = useState(initialData);

  if (open !== previousOpen || initialData !== previousInitialData) {
    setPreviousOpen(open);
    setPreviousInitialData(initialData);

    if (open) {
      setTeacherId(initialData?.teacher_id ? String(initialData.teacher_id) : "");
      setLeaveType(initialData?.leave_type ?? "izin");
      setStartDate(initialData?.start_date ? initialData.start_date.substring(0, 10) : "");
      setEndDate(initialData?.end_date ? initialData.end_date.substring(0, 10) : "");
      setReason(initialData?.reason ?? "");
      setStatus(initialData?.status ?? "menunggu");
      setError(null);
      setFieldErrors({});
    }
  }

  useEffect(() => {
    if (open) {
      teacherService
        .list({ per_page: 100 })
        .then((res) => {
          // Pastikan guru yang sedang diedit selalu ada di daftar opsi
          const list = res.data;
          if (initialData?.teacher && !list.some((t) => t.id === initialData.teacher!.id)) {
            setTeachers([initialData.teacher, ...list]);
          } else {
            setTeachers(list);
          }
        })
        .catch(() => {
          // Jika gagal memuat, setidaknya tampilkan guru yang sedang diedit
          if (initialData?.teacher) {
            setTeachers([initialData.teacher]);
          } else {
            toast.error("Gagal memuat data guru");
          }
        });
    }
  }, [open, initialData]);

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

    const payload: CreateTeacherLeavePayload = {
      teacher_id: Number(teacherId),
      leave_type: leaveType,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      reason: reason.trim() || undefined,
      status,
    };

    try {
      if (initialData) {
        await teacherLeaveService.update(initialData.id, payload);
      } else {
        await teacherLeaveService.create(payload);
      }
      toast.success(
        isEdit
          ? "Data cuti guru berhasil diperbarui."
          : "Data cuti guru berhasil ditambahkan.",
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
      title={isEdit ? "Edit Cuti Guru" : "Tambah Cuti Guru"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="leave-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="leave-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
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
          <FormField label="Jenis Cuti" required error={fieldErrors.leave_type?.[0]}>
            <Select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              options={LEAVE_TYPE_OPTIONS}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Status" error={fieldErrors.status?.[0]}>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={STATUS_OPTIONS}
              disabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Tanggal Mulai" required error={fieldErrors.start_date?.[0]}>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Tanggal Selesai" error={fieldErrors.end_date?.[0]}>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Alasan" required error={fieldErrors.reason?.[0]}>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: Cuti tahunan, surat dokter menyusul"
            disabled={submitting}
            rows={3}
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