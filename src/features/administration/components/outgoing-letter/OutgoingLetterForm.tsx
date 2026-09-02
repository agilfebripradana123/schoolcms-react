import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { outgoingLetterService } from "../../api/outgoing-letter.service";
import type {
  CreateOutgoingLetterPayload,
  LetterCategory,
  OutgoingLetter,
  OutgoingLetterStatus,
} from "../../api/types";

interface OutgoingLetterFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: OutgoingLetter | null;
}

const CategoryOptions: { value: LetterCategory; label: string }[] = [
  { value: "undangan", label: "Undangan" },
  { value: "permohonan", label: "Permohonan" },
  { value: "pemberitahuan", label: "Pemberitahuan" },
  { value: "lainnya", label: "Lainnya" },
];

const StatusOptions: { value: OutgoingLetterStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "terkirim", label: "Terkirim" },
  { value: "diarsipkan", label: "Diarsipkan" },
];

export default function OutgoingLetterForm({
  open,
  onClose,
  onSaved,
  initialData,
}: OutgoingLetterFormProps) {
  const [letterNumber, setLetterNumber] = useState("");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [letterDate, setLetterDate] = useState("");
  const [sentDate, setSentDate] = useState("");
  const [category, setCategory] = useState<LetterCategory>("lainnya");
  const [status, setStatus] = useState<OutgoingLetterStatus>("draft");
  const [filePath, setFilePath] = useState("");
  const [notes, setNotes] = useState("");
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
        setLetterNumber(initialData.letter_number ?? "");
        setRecipient(initialData.recipient ?? "");
        setSubject(initialData.subject ?? "");
        setLetterDate(initialData.letter_date ?? "");
        setSentDate(initialData.sent_date ?? "");
        setCategory(initialData.category ?? "lainnya");
        setStatus(initialData.status ?? "draft");
        setFilePath(initialData.file_path ?? "");
        setNotes(initialData.notes ?? "");
      } else {
        setLetterNumber("");
        setRecipient("");
        setSubject("");
        setLetterDate("");
        setSentDate("");
        setCategory("lainnya");
        setStatus("draft");
        setFilePath("");
        setNotes("");
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateOutgoingLetterPayload = {
      letter_number: letterNumber.trim(),
      recipient: recipient.trim(),
      subject: subject.trim(),
      letter_date: letterDate,
      sent_date: sentDate || null,
      category,
      status,
      file_path: filePath.trim() || null,
      notes: notes.trim() || null,
    };

    try {
      if (initialData) {
        await outgoingLetterService.update(initialData.id, payload);
        toast.success("Surat keluar berhasil diperbarui.");
      } else {
        await outgoingLetterService.create(payload);
        toast.success("Surat keluar berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan surat keluar", {
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
      title={isEdit ? "Edit Surat Keluar" : "Tambah Surat Keluar"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="outgoing-letter-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="outgoing-letter-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="Nomor Surat"
            required
            error={fieldErrors.letter_number?.[0]}
          >
            <Input
              value={letterNumber}
              onChange={(e) => setLetterNumber(e.target.value)}
              placeholder="SK-2026-006"
              maxLength={50}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Tujuan"
            required
            error={fieldErrors.recipient?.[0]}
          >
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Nama instansi tujuan"
              maxLength={150}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Perihal" required error={fieldErrors.subject?.[0]}>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Perihal surat"
            maxLength={200}
            disabled={submitting}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="Tanggal Surat"
            required
            error={fieldErrors.letter_date?.[0]}
          >
            <Input
              type="date"
              value={letterDate}
              onChange={(e) => setLetterDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Tanggal Kirim"
            hint="Opsional, tidak sebelum tanggal surat."
            error={fieldErrors.sent_date?.[0]}
          >
            <Input
              type="date"
              value={sentDate}
              onChange={(e) => setSentDate(e.target.value)}
              min={letterDate || undefined}
              disabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Kategori" required error={fieldErrors.category?.[0]}>
            <AppSelect
              value={category}
              onChange={(v) => setCategory((v ?? "lainnya") as LetterCategory)}
              options={CategoryOptions}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>

          <FormField label="Status" required error={fieldErrors.status?.[0]}>
            <AppSelect
              value={status}
              onChange={(v) => setStatus((v ?? "draft") as OutgoingLetterStatus)}
              options={StatusOptions}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="File / URL"
            hint="Opsional, tautan ke berkas lampiran."
            error={fieldErrors.file_path?.[0]}
          >
            <Input
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="/uploads/surat-keluar/sk-2026-006.pdf"
              maxLength={255}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Catatan"
            hint="Opsional."
            error={fieldErrors.notes?.[0]}
          >
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan surat keluar..."
              maxLength={1000}
              disabled={submitting}
            />
          </FormField>
        </div>

        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}