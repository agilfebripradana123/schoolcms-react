import { useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toApiError } from "@/lib/api";
import { examParticipantService } from "../../api/exam-participant.service";
import type { ExamParticipant } from "../../api/types";

interface ExamParticipantDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  data: ExamParticipant | null;
}

export default function ExamParticipantDeleteDialog({
  open,
  onClose,
  onDeleted,
  data,
}: ExamParticipantDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!data || deleting) return;
    setDeleting(true);

    try {
      await examParticipantService.remove(data.id);
      toast.success("Peserta ujian berhasil dihapus.");
      onDeleted();
    } catch (err) {
      const apiError = toApiError(err);
      toast.error("Gagal menghapus peserta ujian", {
        description: apiError.message,
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title="Hapus Peserta Ujian"
      description="Peserta hanya dapat dihapus jika belum memiliki percobaan ujian (attempt). Jika sudah memiliki attempt, backend akan melindungi riwayat dan menolak penghapusan. Tindakan ini menghapus enrollment peserta yang belum memiliki aktivitas ujian dan tidak dapat dibatalkan."
      confirmText="Hapus"
      cancelText="Batal"
      destructive
      onConfirm={handleDelete}
    />
  );
}