import { toast } from "sonner";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { teacherAssignmentService } from "../../api/teacher-assignment.service";
import type { TeacherAssignment } from "../../api/types";

interface TeacherAssignmentDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  data: TeacherAssignment | null;
}

export default function TeacherAssignmentDeleteDialog({
  open,
  onClose,
  onDeleted,
  data,
}: TeacherAssignmentDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const teacherName = data?.teacher?.full_name ?? (data ? `#${data.teacher_id}` : undefined);
  const subjectName = data?.subject?.name;
  const className = data?.class?.name;

  const handleDelete = async () => {
    if (!data) return;
    setDeleting(true);
    setError(null);

    try {
      await teacherAssignmentService.remove(data.id);
      onDeleted();
      toast.success("Penugasan guru berhasil dihapus.");
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      toast.error("Gagal menghapus penugasan guru", {
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
      title="Hapus Penugasan Guru"
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
        Apakah Anda yakin ingin menghapus penugasan{" "}
        <span className="font-semibold text-on-surface">
          {subjectName ?? ""}
        </span>{" "}
        untuk guru{" "}
        <span className="font-semibold text-on-surface">
          {teacherName ?? ""}
        </span>{" "}
        di kelas{" "}
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
