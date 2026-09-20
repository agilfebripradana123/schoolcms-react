import { useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toApiError } from "@/lib/api";
import { examResultService } from "../../api/exam-result.service";
import type { ExamResult } from "../../api/types";

interface ExamResultDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  data: ExamResult | null;
}

export default function ExamResultDeleteDialog({
  open,
  onClose,
  onDeleted,
  data,
}: ExamResultDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!data || deleting) return;
    setDeleting(true);

    try {
      await examResultService.remove(data.id);
      toast.success("Hasil ujian berhasil dihapus.");
      onDeleted();
    } catch (err) {
      const apiError = toApiError(err);
      toast.error("Gagal menghapus hasil ujian", {
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
      title="Hapus Hasil Ujian"
      description="Hasil yang telah difinalisasi atau disinkronkan ke nilai akademik tidak dapat dihapus. Penghapusan hasil bersifat permanen dan tidak dapat dibatalkan."
      confirmText="Hapus"
      cancelText="Batal"
      destructive
      onConfirm={handleDelete}
    />
  );
}