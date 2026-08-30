import { toast } from "sonner";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { feeTypeService } from "../../api/fee-type.service";
import type { FeeType } from "../../api/types";

interface FeeTypeDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  data: FeeType | null;
}

export default function FeeTypeDeleteDialog({
  open,
  onClose,
  onDeleted,
  data,
}: FeeTypeDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleDelete = async () => {
    if (!data) return;
    setDeleting(true);
    setError(null);

    try {
      await feeTypeService.remove(data.id);
      onDeleted();
      toast.success("Jenis tagihan berhasil dihapus.");
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      toast.error("Gagal menghapus jenis tagihan", {
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
      title="Hapus Jenis Tagihan"
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
        Apakah Anda yakin ingin menghapus jenis tagihan{" "}
        <span className="font-semibold text-on-surface">{data?.name}</span>?
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