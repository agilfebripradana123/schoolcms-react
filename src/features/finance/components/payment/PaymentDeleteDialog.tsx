import { toast } from "sonner";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ApiError } from "@/types";
import { paymentService } from "../../api/payment.service";
import type { Payment } from "../../api/types";

interface PaymentDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  data: Payment | null;
}

function paymentLabel(data: Payment | null): string {
  if (!data) return "";
  const studentName = data.student?.name ?? `#${data.student_id}`;
  const amount = data.amount != null ? ` ${formatCurrency(data.amount)}` : "";
  return `${studentName}${amount}`;
}

export default function PaymentDeleteDialog({
  open,
  onClose,
  onDeleted,
  data,
}: PaymentDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleDelete = async () => {
    if (!data) return;
    setDeleting(true);
    setError(null);

    try {
      await paymentService.remove(data.id);
      onDeleted();
      toast.success("Pembayaran berhasil dihapus.");
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      toast.error("Gagal menghapus pembayaran", {
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
      title="Hapus Pembayaran"
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
        Apakah Anda yakin ingin menghapus pembayaran{" "}
        <span className="font-semibold text-on-surface">
          {paymentLabel(data)}
        </span>{" "}
        {data?.payment_date ? `tanggal ${formatDate(data.payment_date)}` : ""}?
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