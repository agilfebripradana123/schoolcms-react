import { toast } from "sonner";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
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
  const [error, setError] = useState<ApiError | null>(null);

  const handleDelete = async () => {
    if (!data) return;
    setDeleting(true);
    setError(null);

    try {
      await questionBankService.remove(data.id);
      onDeleted();
      toast.success("Soal berhasil dihapus.");
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      toast.error("Gagal menghapus soal", {
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
      title="Hapus Soal"
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
        Apakah Anda yakin ingin menghapus soal berikut? Tindakan ini tidak dapat
        dibatalkan.
      </p>

      {data?.question_text && (
        <p className="mt-3 line-clamp-3 rounded-xl bg-surface-container-lowest px-3 py-2 text-sm font-medium text-on-surface">
          {data.question_text}
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-xl bg-error-container px-3 py-2 text-sm text-error">
          {error.message}
        </p>
      )}
    </Modal>
  );
}
