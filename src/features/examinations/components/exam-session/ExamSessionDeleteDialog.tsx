import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import type { ApiError } from "@/types";
import { toApiError } from "@/lib/api";
import { examSessionService } from "../../api/exam-session.service";
import type { ExamSession } from "../../api/types";

interface ExamSessionDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  data: ExamSession | null;
}

export default function ExamSessionDeleteDialog({
  open,
  onClose,
  onDeleted,
  data,
}: ExamSessionDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleDelete = async () => {
    if (!data) return;
    setDeleting(true);
    setError(null);

    try {
      await examSessionService.remove(data.id);
      onDeleted();
      toast.success("Sesi ujian berhasil dihapus.");
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      toast.error("Gagal menghapus sesi ujian", {
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
      title="Hapus Sesi Ujian"
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
        Apakah Anda yakin ingin menghapus sesi ujian ini? Tindakan ini tidak
        dapat dibatalkan.
      </p>

      {error && (
        <p className="mt-3 rounded-xl bg-error-container px-3 py-2 text-sm text-error">
          {error.message}
        </p>
      )}
    </Modal>
  );
}
