import { toast } from "sonner";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { achievementService } from "@/features/development/api/achievement.service";
import type { Achievement } from "@/features/development/api/types";

interface AchievementDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  data: Achievement | null;
}

export default function AchievementDeleteDialog({
  open,
  onClose,
  onDeleted,
  data,
}: AchievementDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleDelete = async () => {
    if (!data) return;
    setDeleting(true);
    setError(null);

    try {
      await achievementService.remove(data.id);
      onDeleted();
      toast.success("Prestasi berhasil dihapus.");
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      toast.error("Gagal menghapus prestasi", {
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
      title="Hapus Prestasi"
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
        Apakah Anda yakin ingin menghapus prestasi{" "}
        <span className="font-semibold text-on-surface">{data?.title ?? `#${data?.id}`}</span>?
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