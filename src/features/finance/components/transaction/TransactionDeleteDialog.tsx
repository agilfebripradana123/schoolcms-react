import { toast } from "sonner";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { ApiError } from "@/types";
import { paymentTransactionService } from "../../api/payment-transaction.service";
import type { PaymentTransaction } from "../../api/types";

interface TransactionDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  data: PaymentTransaction | null;
}

function transactionLabel(data: PaymentTransaction | null): string {
  if (!data) return "";
  const code = data.transaction_code || `#${data.id}`;
  const student = data.payment?.student?.name ?? "";
  const amount = data.amount != null ? ` ${formatCurrency(data.amount)}` : "";
  return student ? `${code} - ${student}${amount}` : `${code}${amount}`;
}

export default function TransactionDeleteDialog({
  open,
  onClose,
  onDeleted,
  data,
}: TransactionDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleDelete = async () => {
    if (!data) return;
    setDeleting(true);
    setError(null);

    try {
      await paymentTransactionService.remove(data.id);
      onDeleted();
      toast.success("Transaksi berhasil dihapus.");
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      toast.error("Gagal menghapus transaksi", {
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
      title="Hapus Transaksi"
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
        Apakah Anda yakin ingin menghapus transaksi{" "}
        <span className="font-semibold text-on-surface">
          {transactionLabel(data)}
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