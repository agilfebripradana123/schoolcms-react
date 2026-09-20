import { toast } from "sonner";
import { useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toApiError } from "@/lib/api";
import { questionBankService } from "../../api/question.service";
import type { QuestionBank } from "../../api/types";

interface QuestionDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  data: QuestionBank | null;
}

export default function QuestionDeleteDialog({
  open,
  onClose,
  onDeleted,
  data,
}: QuestionDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!data || deleting) return;
    setDeleting(true);

    try {
      await questionBankService.remove(data.id);
      toast.success("Soal berhasil dihapus.");
      onDeleted();
    } catch (err) {
      const apiError = toApiError(err);
      toast.error("Gagal menghapus soal", {
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
      title="Hapus Soal"
      description="Soal akan dihapus secara permanen dari bank soal dan tidak dapat dibatalkan. Jika soal sudah dikomposisikan ke ujian yang operasional, backend akan menolak penghapusan — backend tetap menjadi authority."
      confirmText="Hapus"
      cancelText="Batal"
      destructive
      onConfirm={handleDelete}
    />
  );
}