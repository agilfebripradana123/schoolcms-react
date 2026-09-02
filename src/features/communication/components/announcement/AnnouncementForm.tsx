import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { announcementService } from "../../api/announcement.service";
import type {
  Announcement,
  AnnouncementCategory,
  CreateAnnouncementPayload,
} from "../../api/types";

interface AnnouncementFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Announcement | null;
}

const CategoryOptions: { value: AnnouncementCategory; label: string }[] = [
  { value: "umum", label: "Umum" },
  { value: "guru", label: "Guru" },
  { value: "siswa", label: "Siswa" },
];

export default function AnnouncementForm({
  open,
  onClose,
  onSaved,
  initialData,
}: AnnouncementFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<AnnouncementCategory>("umum");
  const [attachment, setAttachment] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [expiredDate, setExpiredDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isEdit = Boolean(initialData);

  const [previousOpen, setPreviousOpen] = useState(open);
  const [previousInitialData, setPreviousInitialData] = useState(initialData);

  if (open !== previousOpen || initialData !== previousInitialData) {
    setPreviousOpen(open);
    setPreviousInitialData(initialData);

    if (open) {
      setError(null);
      setFieldErrors({});

      if (initialData) {
        setTitle(initialData.title ?? "");
        setContent(initialData.content ?? "");
        setCategory(initialData.category ?? "umum");
        setAttachment(initialData.attachment ?? "");
        setPublishDate(initialData.publish_date ?? "");
        setExpiredDate(initialData.expired_date ?? "");
      } else {
        setTitle("");
        setContent("");
        setCategory("umum");
        setAttachment("");
        setPublishDate("");
        setExpiredDate("");
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateAnnouncementPayload = {
      title: title.trim(),
      content: content.trim(),
      category,
      attachment: attachment.trim() || null,
      publish_date: publishDate || null,
      expired_date: expiredDate || null,
    };

    try {
      if (initialData) {
        await announcementService.update(initialData.id, payload);
        toast.success("Pengumuman berhasil diperbarui.");
      } else {
        await announcementService.create(payload);
        toast.success("Pengumuman berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan pengumuman", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Pengumuman" : "Tambah Pengumuman"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="announcement-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="announcement-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Judul" required error={fieldErrors.title?.[0]}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul pengumuman"
              maxLength={255}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Kategori" required error={fieldErrors.category?.[0]}>
            <AppSelect
              value={category}
              onChange={(v) => setCategory((v ?? "umum") as AnnouncementCategory)}
              options={CategoryOptions}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Konten" required error={fieldErrors.content?.[0]}>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Isi pengumuman..."
            maxLength={2000}
            disabled={submitting}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="Tanggal Terbit"
            hint="Opsional."
            error={fieldErrors.publish_date?.[0]}
          >
            <Input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Tanggal Kadaluarsa"
            hint="Opsional, tidak sebelum tanggal terbit."
            error={fieldErrors.expired_date?.[0]}
          >
            <Input
              type="date"
              value={expiredDate}
              onChange={(e) => setExpiredDate(e.target.value)}
              min={publishDate || undefined}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField
          label="Lampiran"
          hint="Opsional, tautan ke berkas lampiran."
          error={fieldErrors.attachment?.[0]}
        >
          <Input
            value={attachment}
            onChange={(e) => setAttachment(e.target.value)}
            placeholder="/uploads/pengumuman/sk-pembagian-rapor.pdf"
            maxLength={255}
            disabled={submitting}
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