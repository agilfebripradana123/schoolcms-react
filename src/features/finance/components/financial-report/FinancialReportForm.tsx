import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { financialReportService } from "../../api/financial-report.service";
import { userManagementService } from "@/features/system/api/user.service";
import type { UserManagement } from "@/features/system/api/types";
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
  const [totalBilled, setTotalBilled] = useState("");
  const [totalPaid, setTotalPaid] = useState("");
  const [totalOutstanding, setTotalOutstanding] = useState("");
  const [generatedBy, setGeneratedBy] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [generators, setGenerators] = useState<UserManagement[]>([]);
  const [generatorsLoading, setGeneratorsLoading] = useState(false);
  const [generatorsError, setGeneratorsError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadGenerators = useCallback(() => {
    setGeneratorsLoading(true);
    setGeneratorsError(false);
    userManagementService
      .list({ per_page: 100 })
      .then((res) => {
        setGenerators(res.data);
        setGeneratorsError(false);
      })
      .catch(() => {
        setGeneratorsError(true);
      })
      .finally(() => {
        setGeneratorsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});
      loadGenerators();

      if (initialData) {
        setTitle(initialData.title);
        setReportType(initialData.report_type);
        setPeriodStart(initialData.period_start ?? "");
        setPeriodEnd(initialData.period_end ?? "");
        setTotalBilled(initialData.total_billed != null ? String(initialData.total_billed) : "");
        setTotalPaid(initialData.total_paid != null ? String(initialData.total_paid) : "");
        setTotalOutstanding(
          initialData.total_outstanding != null ? String(initialData.total_outstanding) : "",
        );
        setGeneratedBy(initialData.generated_by != null ? String(initialData.generated_by) : "");
        setNotes(initialData.notes ?? "");
      } else {
        setTitle("");
        setReportType("bulanan");
        setPeriodStart("");
        setPeriodEnd("");
        setTotalBilled("");
        setTotalPaid("");
        setTotalOutstanding("");
        setGeneratedBy("");
        setNotes("");
      }
    }
  }, [open, initialData, loadGenerators]);

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

    const toNumber = (value: string): number | undefined => {
      if (value === "") return undefined;
      const n = Number(value);
      return Number.isNaN(n) ? undefined : n;
    };

    const payload: CreateFinancialReportPayload = {
      title: title.trim(),
      report_type: reportType,
      period_start: periodStart,
      period_end: periodEnd,
      total_billed: toNumber(totalBilled),
      total_paid: toNumber(totalPaid),
      total_outstanding: toNumber(totalOutstanding),
      generated_by: generatedBy ? Number(generatedBy) : undefined,
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

  const generatorOptions = generators.map((u) => ({ value: String(u.id), label: u.name }));

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

          <FormField
            label="Total Tagihan"
            hint="Opsional. Nominal rupiah."
            error={fieldErrors.total_billed?.[0]}
          >
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={totalBilled}
              onChange={(e) => setTotalBilled(e.target.value)}
              placeholder="0"
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Total Dibayar"
            hint="Opsional. Nominal rupiah."
            error={fieldErrors.total_paid?.[0]}
          >
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={totalPaid}
              onChange={(e) => setTotalPaid(e.target.value)}
              placeholder="0"
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Total Tertunggak"
            hint="Opsional. Nominal rupiah."
            error={fieldErrors.total_outstanding?.[0]}
          >
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={totalOutstanding}
              onChange={(e) => setTotalOutstanding(e.target.value)}
              placeholder="0"
              disabled={submitting}
            />
          </FormField>

          <FormField label="Dibuat Oleh" hint="Opsional." error={fieldErrors.generated_by?.[0]}>
            {generatorsLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat pengguna...
              </div>
            ) : generatorsError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data pengguna.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadGenerators}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : generators.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada pengguna tersedia.
              </p>
            ) : (
              <AppSelect
                value={generatedBy}
                onChange={(v) => setGeneratedBy(v ?? "")}
                options={generatorOptions}
                placeholder="Pilih Pengguna"
                isClearable
                isDisabled={submitting}
              />
            )}
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