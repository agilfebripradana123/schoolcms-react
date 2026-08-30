import { toast } from "sonner";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { scheduleService } from "../../api/schedule.service";
import type { Schedule } from "../../api/types";

interface ScheduleDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  data: Schedule | null;
}

function scheduleLabel(data: Schedule | null): string {
  if (!data) return "";
  const dayLabel =
    { senin: "Senin", selasa: "Selasa", rabu: "Rabu", kamis: "Kamis", jumat: "Jumat", sabtu: "Sabtu" }[
      data.day
    ] ?? data.day;
  const subjectName = data.subject?.name ?? `#${data.subject_id}`;
  const className = data.class?.name ?? `#${data.class_id}`;
  return `${dayLabel} - ${subjectName} (${className})`;
}

export default function ScheduleDeleteDialog({
  open,
  onClose,
  onDeleted,
  data,
}: ScheduleDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleDelete = async () => {
    if (!data) return;
    setDeleting(true);
    setError(null);

    try {
      await scheduleService.remove(data.id);
      onDeleted();
      toast.success("Jadwal berhasil dihapus.");
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      toast.error("Gagal menghapus jadwal", {
        description: apiError.message,
      });
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
          <Button variant="ghost" onClick={onClose} disabled={deleting}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            Hapus
          </Button>
        </>
      }
    >
      <p className="text-sm text-on-surface-variant">
        Apakah Anda yakin ingin menghapus jadwal{" "}
        <span className="font-semibold text-on-surface">
          {scheduleLabel(data)}
        </span>
        ? Tindakan ini tidak dapat dibatalkan.
      </p>

      {error && (
        <p className="mt-3 rounded-xl bg-error-container px-3 py-2 text-sm text-error">
          {error.message}
        </p>
      )}
    </Modal>
  );
}