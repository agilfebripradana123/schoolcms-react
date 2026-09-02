import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { incomingLetterService } from "../../api/incoming-letter.service";
import type {
  CreateIncomingLetterPayload,
  IncomingLetter,
  IncomingLetterStatus,
  LetterCategory,
} from "../../api/types";

interface IncomingLetterFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: IncomingLetter | null;
}

const CategoryOptions: { value: LetterCategory; label: string }[] = [
  { value: "undangan", label: "Undangan" },
  { value: "permohonan", label: "Permohonan" },
  { value: "pemberitahuan", label: "Pemberitahuan" },
  { value: "lainnya", label: "Lainnya" },
];

const StatusOptions: { value: IncomingLetterStatus; label: string }[] = [
  { value: "baru", label: "Baru" },
  { value: "diproses", label: "Diproses" },
  { value: "selesai", label: "Selesai" },
  { value: "diarsipkan", label: "Diarsipkan" },
];

export default function IncomingLetterForm({
  open,
  onClose,
  onSaved,
  initialData,
}: IncomingLetterFormProps) {
  const [letterNumber, setLetterNumber] = useState("");
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [letterDate, setLetterDate] = useState("");
  const [category, setCategory] = useState<LetterCategory>("lainnya");
  const [isImportant, setIsImportant] = useState(false);
  const [status, setStatus] = useState<IncomingLetterStatus>("baru");
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
        setSender(initialData.sender ?? "");
        setSubject(initialData.subject ?? "");
        setReceivedDate(initialData.received_date ?? "");
        setLetterDate(initialData.letter_date ?? "");
        setCategory(initialData.category ?? "lainnya");
        setIsImportant(initialData.is_important ?? false);
        setStatus(initialData.status ?? "baru");
        setFilePath(initialData.file_path ?? "");
        setNotes(initialData.notes ?? "");
      } else {
        setLetterNumber("");
        setSender("");
        setSubject("");
        setReceivedDate("");
        setLetterDate("");
        setCategory("lainnya");
        setIsImportant(false);
        setStatus("baru");
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

    const payload: CreateIncomingLetterPayload = {
      letter_number: letterNumber.trim(),
      sender: sender.trim(),
      subject: subject.trim(),
      received_date: receivedDate,
      letter_date: letterDate || null,
      category,
      is_important: isImportant,
      status,
      file_path: filePath.trim() || null,
      notes: notes.trim() || null,
    };

    try {
      if (initialData) {
        await incomingLetterService.update(initialData.id, payload);
        toast.success("Surat masuk berhasil diperbarui.");
      } else {
        await incomingLetterService.create(payload);
        toast.success("Surat masuk berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan surat masuk", {
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
      title={isEdit ? "Edit Surat Masuk" : "Tambah Surat Masuk"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="incoming-letter-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="incoming-letter-form"
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
              placeholder="SM-2026-006"
              maxLength={50}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Pengirim" required error={fieldErrors.sender?.[0]}>
            <Input
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="Nama instansi pengirim"
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
            label="Tanggal Diterima"
            required
            error={fieldErrors.received_date?.[0]}
          >
            <Input
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Tanggal Surat"
            hint="Opsional."
            error={fieldErrors.letter_date?.[0]}
          >
            <Input
              type="date"
              value={letterDate}
              onChange={(e) => setLetterDate(e.target.value)}
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
              onChange={(v) => setStatus((v ?? "baru") as IncomingLetterStatus)}
              options={StatusOptions}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <input
            type="checkbox"
            checked={isImportant}
            onChange={(e) => setIsImportant(e.target.checked)}
            disabled={submitting}
            className="h-4 w-4 rounded border-slate-300 text-primary-container focus:ring-primary-container"
          />
          <span className="text-sm font-semibold text-on-surface">
            Tandai sebagai Surat Penting
          </span>
        </label>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="File / URL"
            hint="Opsional, tautan ke berkas lampiran."
            error={fieldErrors.file_path?.[0]}
          >
            <Input
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="/uploads/surat-masuk/sm-2026-006.pdf"
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
              placeholder="Catatan surat masuk..."
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