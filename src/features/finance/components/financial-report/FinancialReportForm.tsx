import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { financialReportService } from "../../api/financial-report.service";
import type {
  CreateFinancialReportPayload,
  FinancialReport,
  FinancialReportType,
} from "../../api/types";

interface FinancialReportFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: FinancialReport | null;
}

const TYPE_OPTIONS: Array<{ value: FinancialReportType; label: string }> = [
  { value: "harian", label: "Harian" },
  { value: "bulanan", label: "Bulanan" },
  { value: "semester", label: "Semester" },
  { value: "tahunan", label: "Tahunan" },
  { value: "custom", label: "Kustom" },
];

export default function FinancialReportForm({
  open,
  onClose,
  onSaved,
  initialData,
}: FinancialReportFormProps) {
  const [title, setTitle] = useState("");
  const [reportType, setReportType] = useState<FinancialReportType>("bulanan");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
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
        setTitle(initialData.title);
        setReportType(initialData.report_type);
        setPeriodStart(initialData.period_start ?? "");
        setPeriodEnd(initialData.period_end ?? "");
        setNotes(initialData.notes ?? "");
      } else {
        setTitle("");
        setReportType("bulanan");
        setPeriodStart("");
        setPeriodEnd("");
        setNotes("");
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    if (!periodStart || !periodEnd) {
      setError({ message: "Periode awal dan akhir wajib diisi." });
      setSubmitting(false);
      return;
    }
    if (periodEnd < periodStart) {
      setError({ message: "Periode akhir harus setelah atau sama dengan periode awal." });
      setSubmitting(false);
      return;
    }

    const payload: CreateFinancialReportPayload = {
      title: title.trim(),
      report_type: reportType,
      period_start: periodStart,
      period_end: periodEnd,
      notes: notes.trim() || undefined,
    };

    try {
      if (initialData) {
        await financialReportService.update(initialData.id, payload);
        toast.success("Laporan keuangan berhasil diperbarui.");
      } else {
        await financialReportService.create(payload);
        toast.success("Laporan keuangan berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan laporan keuangan", {
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
      title={isEdit ? "Edit Laporan Keuangan" : "Tambah Laporan Keuangan"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="financial-report-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="financial-report-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Judul" required error={fieldErrors.title?.[0]}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Laporan Keuangan Bulanan"
              maxLength={200}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Jenis Laporan" required error={fieldErrors.report_type?.[0]}>
            <AppSelect
              value={reportType}
              onChange={(v) => setReportType((v ?? "bulanan") as FinancialReportType)}
              options={TYPE_OPTIONS}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>

          <FormField label="Periode Awal" required error={fieldErrors.period_start?.[0]}>
            <Input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Periode Akhir" required error={fieldErrors.period_end?.[0]}>
            <Input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Catatan" hint="Opsional." error={fieldErrors.notes?.[0]}>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan laporan keuangan..."
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