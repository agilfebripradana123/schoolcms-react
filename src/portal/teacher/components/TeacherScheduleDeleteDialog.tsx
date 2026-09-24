import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import apiClient from "@/lib/api/axios";
import { TEACHER_MANAGE, toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import type { Schedule, ScheduleDay } from "@/features/academic/api/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  data: Schedule | null;
}

const DAY_LABELS: Record<ScheduleDay, string> = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
};

function scheduleLabel(data: Schedule | null): string {
  if (!data) return "";
  const dayLabel = DAY_LABELS[data.day] ?? data.day;
  const subjectName = data.subject?.name ?? (data.subject_id != null ? `#${data.subject_id}` : "");
  const className = data.class?.name ?? (data.class_id != null ? `#${data.class_id}` : "");
  return `${dayLabel} - ${subjectName} (${className})`;
}

export default function TeacherScheduleDeleteDialog({ open, onClose, onDeleted, data }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleDelete = async () => {
    if (!data) return;
    setDeleting(true);
    setError(null);
    try {
      await apiClient.delete(`${TEACHER_MANAGE.SCHEDULES}/${data.id}`);
      toast.success("Jadwal berhasil dihapus.");
      onDeleted();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      toast.error("Gagal menghapus jadwal", { description: apiError.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Hapus Jadwal"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={deleting}>Batal</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>Hapus</Button>
        </>
      }
    >
      <p className="text-sm text-on-surface-variant">
        Hapus jadwal <span className="font-semibold text-on-surface">{scheduleLabel(data)}</span>? Tindakan ini tidak dapat dibatalkan.
      </p>
      {error && <p className="mt-3 rounded-xl bg-error-container px-3 py-2 text-sm text-error">{error.message}</p>}
    </Modal>
  );
}