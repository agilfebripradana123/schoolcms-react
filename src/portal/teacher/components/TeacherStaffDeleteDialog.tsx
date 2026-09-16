import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import apiClient from "@/lib/api/axios";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  data: { id: number; name: string } | null;
}

export default function TeacherStaffDeleteDialog({ open, onClose, onDeleted, data }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleDelete = async () => {
    if (!data) return;
    setDeleting(true);
    setError(null);
    try {
      await apiClient.delete(`/teacher/staff/${data.id}`);
      toast.success("Staf berhasil dihapus.");
      onDeleted();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      toast.error("Gagal menghapus staf.", { description: apiError.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Hapus Staf"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={deleting}>Batal</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>Hapus</Button>
        </>
      }
    >
      <p className="text-sm text-on-surface-variant">
        Hapus staf <span className="font-semibold text-on-surface">{data?.name}</span>? Tindakan ini tidak dapat dibatalkan.
      </p>
      {error && <p className="mt-3 rounded-xl bg-error-container px-3 py-2 text-sm text-error">{error.message}</p>}
    </Modal>
  );
}
