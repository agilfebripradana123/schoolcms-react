import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { teacherDocumentService } from "../api/teacher-document.service";
import { teacherService } from "../api/teacher.service";
import { formatTeacherName, type CreateTeacherDocumentPayload, type Teacher, type TeacherDocument } from "../api/types";

interface TeacherDocumentFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: TeacherDocument | null;
}

const DOCUMENT_TYPE_OPTIONS = [
  { value: "sk", label: "SK / Surat Keputusan" },
  { value: "ijazah", label: "Ijazah" },
  { value: "sertifikat", label: "Sertifikat" },
  { value: "kontrak", label: "Kontrak" },
  { value: "lainnya", label: "Lainnya" },
];

export default function TeacherDocumentForm({
  open,
  onClose,
  onSaved,
  initialData,
}: TeacherDocumentFormProps) {
  const isEdit = Boolean(initialData);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("sk");
  const [issuedDate, setIssuedDate] = useState("");
  const [filePath, setFilePath] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (open) {
      setTeacherId(initialData?.teacher_id ? String(initialData.teacher_id) : "");
      setTitle(initialData?.title ?? "");
      setDocumentType(initialData?.document_type ?? "sk");
      setIssuedDate(initialData?.issued_date ? initialData.issued_date.substring(0, 10) : "");
      setFilePath(initialData?.file_path ?? "");
      setNotes(initialData?.notes ?? "");
      setError(null);
      setFieldErrors({});
    }
  }, [open, initialData]);

  useEffect(() => {
    if (open) {
      teacherService.list().then((res) => setTeachers(res.data)).catch(() => {
        toast.error("Gagal memuat data guru");
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    if (!teacherId) {
      setError({ message: "Guru wajib dipilih." });
      setSubmitting(false);
      return;
    }
    if (!title.trim()) {
      setError({ message: "Judul dokumen wajib diisi." });
      setSubmitting(false);
      return;
    }

    const payload: CreateTeacherDocumentPayload = {
      teacher_id: Number(teacherId),
      title: title.trim(),
      document_type: documentType,
      issued_date: issuedDate || undefined,
      file_path: filePath.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      if (initialData) {
        await teacherDocumentService.update(initialData.id, payload);
      } else {
        await teacherDocumentService.create(payload);
      }
      toast.success(
        isEdit
          ? "Dokumen guru berhasil diperbarui."
          : "Dokumen guru berhasil ditambahkan.",
      );
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error(apiError.message || "Gagal menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Dokumen Guru" : "Tambah Dokumen Guru"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="doc-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="doc-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="Guru" required error={fieldErrors.teacher_id?.[0]}>
          <Select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            options={teachers.map((t) => ({
              value: String(t.id),
              label: formatTeacherName(t),
            }))}
            placeholder="Pilih guru"
            disabled={submitting}
          />
        </FormField>

        <FormField label="Judul Dokumen" required error={fieldErrors.title?.[0]}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: SK CPNS, Ijazah S1"
            disabled={submitting}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Jenis Dokumen" required error={fieldErrors.document_type?.[0]}>
            <Select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              options={DOCUMENT_TYPE_OPTIONS}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Tanggal Terbit" error={fieldErrors.issued_date?.[0]}>
            <Input
              type="date"
              value={issuedDate}
              onChange={(e) => setIssuedDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="File / URL" hint="Opsional, tautan ke berkas dokumen" error={fieldErrors.file_path?.[0]}>
          <Input
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="/uploads/dokumen/sk-cpns.pdf"
            disabled={submitting}
          />
        </FormField>

        <FormField label="Catatan" error={fieldErrors.notes?.[0]}>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Periode satu tahun"
            disabled={submitting}
            rows={2}
          />
        </FormField>

        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}