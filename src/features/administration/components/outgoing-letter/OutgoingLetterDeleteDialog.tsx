import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { outgoingLetterService } from "../../api/outgoing-letter.service";
import type { OutgoingLetter } from "../../api/types";

interface OutgoingLetterDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  data: OutgoingLetter | null;
}

export default function OutgoingLetterDeleteDialog({
  open,
  onClose,
  onDeleted,
  data,
}: OutgoingLetterDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleDelete = async () => {
    if (!data) return;
    setDeleting(true);
    setError(null);

    try {
      await outgoingLetterService.remove(data.id);
      onDeleted();
      toast.success("Surat keluar berhasil dihapus.");
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      toast.error("Gagal menghapus surat keluar", {
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
      title="Hapus Surat Keluar"
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
        Apakah Anda yakin ingin menghapus surat keluar{" "}
        <span className="font-semibold text-on-surface">
          {data?.letter_number}
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