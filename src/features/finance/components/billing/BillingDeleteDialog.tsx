import { toast } from "sonner";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { billingService } from "../../api/billing.service";
import type { Billing } from "../../api/types";

interface BillingDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  data: Billing | null;
}

function billingLabel(data: Billing | null): string {
  if (!data) return "";
  const studentName = data.student?.name ?? `#${data.student_id}`;
  const feeTypeName = data.fee_type?.name ?? `#${data.fee_type_id}`;
  return `${feeTypeName} - ${studentName}`;
}

export default function BillingDeleteDialog({
  open,
  onClose,
  onDeleted,
  data,
}: BillingDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleDelete = async () => {
    if (!data) return;
    setDeleting(true);
    setError(null);

    try {
      await billingService.remove(data.id);
      onDeleted();
      toast.success("Penagihan berhasil dihapus.");
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      toast.error("Gagal menghapus penagihan", {
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
      title="Hapus Penagihan"
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
        Apakah Anda yakin ingin menghapus penagihan{" "}
        <span className="font-semibold text-on-surface">{billingLabel(data)}</span>
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