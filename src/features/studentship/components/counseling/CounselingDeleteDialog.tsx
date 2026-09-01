import { toast } from "sonner";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { counselingService } from "../../api/counseling.service";
import type { Counseling } from "../../api/types";

interface CounselingDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  data: Counseling | null;
}

export default function CounselingDeleteDialog({
  open,
  onClose,
  onDeleted,
  data,
}: CounselingDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleDelete = async () => {
    if (!data) return;
    setDeleting(true);
    setError(null);

    try {
      await counselingService.remove(data.id);
      onDeleted();
      toast.success("Data bimbingan berhasil dihapus.");
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      toast.error("Gagal menghapus data bimbingan", {
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
      title="Hapus Data Bimbingan"
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
        Apakah Anda yakin ingin menghapus data bimbingan dari {data?.student?.name ?? `#${data?.student_id}`} pada tanggal {data?.counseling_date}?
        Tindakan ini tidak dapat dibatalkan.
      </p>

      {error && (
        <p className="mt-3 rounded-xl bg-error-container px-3 py-2 text-sm text-error">
          {error.message}
        </p>
      )}
    </Modal>
  );
}