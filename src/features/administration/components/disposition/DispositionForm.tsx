import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { dispositionService } from "../../api/disposition.service";
import { incomingLetterService } from "../../api/incoming-letter.service";
import type {
  CreateDispositionPayload,
  Disposition,
  DispositionStatus,
  IncomingLetter,
} from "../../api/types";

interface DispositionFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Disposition | null;
}

const StatusOptions: { value: DispositionStatus; label: string }[] = [
  { value: "belum", label: "Belum" },
  { value: "proses", label: "Proses" },
  { value: "selesai", label: "Selesai" },
];

export default function DispositionForm({
  open,
  onClose,
  onSaved,
  initialData,
}: DispositionFormProps) {
  const [incomingLetterId, setIncomingLetterId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [instruction, setInstruction] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<DispositionStatus>("belum");
  const [completedAt, setCompletedAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [letters, setLetters] = useState<IncomingLetter[]>([]);
  const [lettersLoading, setLettersLoading] = useState(false);
  const [lettersError, setLettersError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadLetters = useCallback(() => {
    incomingLetterService
      .list({ per_page: 200 })
      .then((res) => {
        setLetters(res.data);
        setLettersError(false);
      })
      .catch(() => {
        setLettersError(true);
      })
      .finally(() => {
        setLettersLoading(false);
      });
  }, []);

  const [previousOpen, setPreviousOpen] = useState(open);
  const [previousInitialData, setPreviousInitialData] = useState(initialData);

  if (open !== previousOpen || initialData !== previousInitialData) {
    setPreviousOpen(open);
    setPreviousInitialData(initialData);

    if (open) {
      setError(null);
      setFieldErrors({});
      setLettersLoading(true);
      setLettersError(false);

      if (initialData) {
        setIncomingLetterId(
          initialData.incoming_letter_id != null
            ? String(initialData.incoming_letter_id)
            : "",
        );
        setAssignedTo(initialData.assigned_to ?? "");
        setInstruction(initialData.instruction ?? "");
        setDueDate(initialData.due_date ?? "");
        setStatus(initialData.status ?? "belum");
        setCompletedAt(
          initialData.completed_at ? initialData.completed_at.slice(0, 16) : "",
        );
      } else {
        setIncomingLetterId("");
        setAssignedTo("");
        setInstruction("");
        setDueDate("");
        setStatus("belum");
        setCompletedAt("");
      }
    }
  }

  useEffect(() => {
    if (open) {
      loadLetters();
    }
  }, [open, loadLetters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateDispositionPayload = {
      incoming_letter_id: Number(incomingLetterId),
      assigned_to: assignedTo.trim(),
      instruction: instruction.trim() || null,
      due_date: dueDate || null,
      status,
      completed_at: completedAt || null,
    };

    try {
      if (initialData) {
        await dispositionService.update(initialData.id, payload);
        toast.success("Disposisi berhasil diperbarui.");
      } else {
        await dispositionService.create(payload);
        toast.success("Disposisi berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan disposisi", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const letterOptions = letters.map((l) => ({
    value: String(l.id),
    label: l.letter_number ? `${l.letter_number} — ${l.subject}` : `${l.subject} (#${l.id})`,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Disposisi" : "Tambah Disposisi"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="disposition-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="disposition-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <FormField
          label="Surat Masuk"
          required
          error={fieldErrors.incoming_letter_id?.[0]}
        >
          {lettersLoading ? (
            <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Memuat surat masuk...
            </div>
          ) : lettersError ? (
            <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
              <span>Gagal memuat data surat masuk.</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setLettersLoading(true);
                  setLettersError(false);
                  loadLetters();
                }}
                className="self-start"
              >
                Muat Ulang
              </Button>
            </div>
          ) : letters.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
              Tidak ada surat masuk tersedia.
            </p>
          ) : (
            <AppSelect
              value={incomingLetterId}
              onChange={(v) => setIncomingLetterId(v ?? "")}
              options={letterOptions}
              placeholder="Pilih Surat Masuk"
              isDisabled={submitting}
            />
          )}
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="Diteruskan Kepada"
            required
            error={fieldErrors.assigned_to?.[0]}
          >
            <Input
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Contoh: Wakil Kurikulum"
              maxLength={150}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Batas Waktu"
            hint="Opsional."
            error={fieldErrors.due_date?.[0]}
          >
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Status" required error={fieldErrors.status?.[0]}>
            <AppSelect
              value={status}
              onChange={(v) => setStatus((v ?? "belum") as DispositionStatus)}
              options={StatusOptions}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>

          <FormField
            label="Selesai Pada"
            hint="Opsional, diisi saat disposisi selesai."
            error={fieldErrors.completed_at?.[0]}
          >
            <Input
              type="datetime-local"
              value={completedAt}
              onChange={(e) => setCompletedAt(e.target.value)}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField
          label="Instruksi"
          hint="Opsional."
          error={fieldErrors.instruction?.[0]}
        >
          <Textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Instruksi disposisi..."
            maxLength={1000}
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