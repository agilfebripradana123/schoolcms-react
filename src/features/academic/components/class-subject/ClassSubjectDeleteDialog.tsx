import { toast } from "sonner";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { classSubjectService } from "../../api/class-subject.service";
import type { ClassSubject } from "../../api/types";

interface ClassSubjectDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  data: ClassSubject | null;
}

export default function ClassSubjectDeleteDialog({
  open,
  onClose,
  onDeleted,
  data,
}: ClassSubjectDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const className = data?.class?.name;
  const subjectName = data?.subject?.name;

  const handleDelete = async () => {
    if (!data) return;
    setDeleting(true);
    setError(null);

    try {
      await classSubjectService.remove(data.id);
      onDeleted();
      toast.success("Mata pelajaran kelas berhasil dihapus.");
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      toast.error("Gagal menghapus mata pelajaran kelas", {
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
      title="Hapus Mata Pelajaran Kelas"
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
        Apakah Anda yakin ingin menghapus mata pelajaran{" "}
        <span className="font-semibold text-on-surface">
          {subjectName ?? ""}
        </span>{" "}
        dari kelas{" "}
        <span className="font-semibold text-on-surface">{className ?? ""}</span>?
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
