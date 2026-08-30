import { toast } from "sonner";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { scholarshipService } from "../../api/scholarship.service";
import type { Scholarship } from "../../api/types";

interface ScholarshipDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  data: Scholarship | null;
}

function scholarshipLabel(data: Scholarship | null): string {
  if (!data) return "";
  const studentName = data.student?.name ?? `#${data.student_id}`;
  return `${data.name} - ${studentName}`;
}

export default function ScholarshipDeleteDialog({
  open,
  onClose,
  onDeleted,
  data,
}: ScholarshipDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleDelete = async () => {
    if (!data) return;
    setDeleting(true);
    setError(null);

    try {
      await scholarshipService.remove(data.id);
      onDeleted();
      toast.success("Beasiswa berhasil dihapus.");
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      toast.error("Gagal menghapus beasiswa", {
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
      title="Hapus Beasiswa"
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
        Apakah Anda yakin ingin menghapus beasiswa{" "}
        <span className="font-semibold text-on-surface">
          {scholarshipLabel(data)}
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