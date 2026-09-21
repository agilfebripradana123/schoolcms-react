import { useCallback, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { FormField } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import { toApiError } from "@/lib/api";
import type { Subject } from "@/features/academic/api/types";
import { questionBankService } from "../../api/question.service";
import type {
  QuestionImportError,
  QuestionImportPreviewData,
  QuestionImportPreviewRow,
} from "../../api/types";

interface QuestionImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
  subjects: Subject[];
  initialSubjectId?: string;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const TEMPLATE_FILENAME = "question-bank-import-template.xlsx";

const TYPE_LABEL: Record<string, string> = {
  multiple_choice: "Pilihan Ganda",
  essay: "Esai",
};

interface ImportValidationPayload {
  message?: string;
  data?: Partial<QuestionImportPreviewData>;
}

/**
 * Backend uses HTTP 422 for two different concerns:
 *  1. request validation  -> { success, message, errors: { field: string[] } }
 *  2. business validation -> { success, message, data: { ..., errors: [{row,field,message}] } }
 *
 * toApiError() only understands the first shape, so the nested row-level
 * business errors are extracted here without touching the global helper.
 */
function extractBusinessValidation(error: unknown): ImportValidationPayload | null {
  if (!(error instanceof AxiosError)) return null;
  if (error.response?.status !== 422) return null;
  const payload = error.response.data as ImportValidationPayload | undefined;
  if (payload?.data && Array.isArray(payload.data.errors)) return payload;
  return null;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export default function QuestionImportDialog({
  open,
  onClose,
  onImported,
  subjects,
  initialSubjectId,
}: QuestionImportDialogProps) {
  const [subjectId, setSubjectId] = useState(initialSubjectId ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<QuestionImportPreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<QuestionImportError[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const busy = previewLoading || importing || downloadLoading;

  const subjectOptions = useMemo(
    () => subjects.map((s) => ({ value: String(s.id), label: s.name })),
    [subjects],
  );

  const resetPreviewState = useCallback(() => {
    setPreview(null);
    setValidationErrors([]);
    setErrorMessage(null);
    setFieldErrors({});
  }, []);

  const handleSubjectChange = useCallback(
    (value: string | null) => {
      setSubjectId(value ?? "");
      resetPreviewState();
    },
    [resetPreviewState],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0] ?? null;
      resetPreviewState();

      if (!selected) {
        setFile(null);
        return;
      }

      if (!selected.name.toLowerCase().endsWith(".xlsx")) {
        setFile(null);
        setErrorMessage("File harus berformat .xlsx.");
        e.target.value = "";
        return;
      }

      if (selected.size > MAX_FILE_BYTES) {
        setFile(null);
        setErrorMessage("Ukuran file maksimal 5 MB.");
        e.target.value = "";
        return;
      }

      setFile(selected);
    },
    [resetPreviewState],
  );

  const buildFormData = useCallback((): FormData => {
    const fd = new FormData();
    fd.append("subject_id", subjectId);
    if (file) fd.append("file", file);
    return fd;
  }, [subjectId, file]);

  const handleDownloadTemplate = useCallback(async () => {
    setDownloadLoading(true);
    try {
      const blob = await questionBankService.downloadImportTemplate();
      downloadBlob(blob, TEMPLATE_FILENAME);
      toast.success("Template berhasil diunduh.");
    } catch (err) {
      toast.error("Gagal mengunduh template", {
        description: toApiError(err).message,
      });
    } finally {
      setDownloadLoading(false);
    }
  }, []);

  const handlePreview = useCallback(async () => {
    if (!subjectId) {
      setErrorMessage("Pilih mata pelajaran terlebih dahulu.");
      return;
    }
    if (!file) {
      setErrorMessage("Pilih file XLSX terlebih dahulu.");
      return;
    }

    setPreviewLoading(true);
    setErrorMessage(null);
    setFieldErrors({});
    setValidationErrors([]);

    try {
      const res = await questionBankService.previewImport(buildFormData());
      setPreview(res.data);
      setValidationErrors(res.data.errors ?? []);
      if (res.data.invalid_rows > 0) {
        toast.error("Preview selesai dengan masalah", {
          description: `${res.data.invalid_rows} baris bermasalah.`,
        });
      } else {
        toast.success(`${res.data.valid_rows} baris valid.`);
      }
    } catch (err) {
      const business = extractBusinessValidation(err);
      if (business?.data) {
        const data = business.data;
        const errors = data.errors ?? [];
        setPreview({
          total_rows: data.total_rows ?? 0,
          valid_rows: data.valid_rows ?? 0,
          invalid_rows: data.invalid_rows ?? 0,
          errors,
          preview: data.preview ?? [],
        });
        setValidationErrors(errors);
        if (errors.length === 0) {
          setErrorMessage(business.message ?? "File tidak dapat diproses.");
        }
      } else {
        const apiError = toApiError(err);
        setErrorMessage(apiError.message);
        if (apiError.errors) setFieldErrors(apiError.errors);
      }
    } finally {
      setPreviewLoading(false);
    }
  }, [subjectId, file, buildFormData]);

  const handleImport = useCallback(async () => {
    if (!subjectId || !file || !preview || preview.invalid_rows > 0 || importing) {
      return;
    }

    setImporting(true);
    setErrorMessage(null);

    try {
      const res = await questionBankService.importQuestions(buildFormData());
      toast.success(`${res.data.imported_count} soal berhasil diimpor sebagai Draft.`);
      onImported();
    } catch (err) {
      const business = extractBusinessValidation(err);
      if (business?.data) {
        const data = business.data;
        const errors = data.errors ?? [];
        setValidationErrors(errors);
        setPreview((prev) =>
          prev
            ? {
                ...prev,
                total_rows: data.total_rows ?? prev.total_rows,
                valid_rows: data.valid_rows ?? prev.valid_rows,
                invalid_rows: data.invalid_rows ?? prev.invalid_rows,
                errors,
              }
            : prev,
        );
        if (errors.length === 0) {
          setErrorMessage(business.message ?? "Import ditolak.");
        }
        toast.error("Import gagal", {
          description: business.message ?? "Terdapat baris yang tidak valid.",
        });
      } else {
        const apiError = toApiError(err);
        setErrorMessage(apiError.message);
        toast.error("Gagal mengimpor soal", { description: apiError.message });
      }
    } finally {
      setImporting(false);
    }
  }, [subjectId, file, preview, importing, buildFormData, onImported]);

  const groupedErrors = useMemo(() => {
    const map = new Map<number, QuestionImportError[]>();
    for (const error of validationErrors) {
      const list = map.get(error.row) ?? [];
      list.push(error);
      map.set(error.row, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [validationErrors]);

  const columns = useMemo(() => {
    type Row = QuestionImportPreviewRow;
    return [
      {
        header: "Baris",
        accessor: "excel_row" as keyof Row,
        headerClassName:
          "px-4 py-3 text-center text-xs font-medium text-outline uppercase tracking-wider",
        className: "px-4 py-3 text-center text-sm text-on-surface",
      },
      {
        header: "Soal",
        accessor: "question_text" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="line-clamp-2 max-w-[320px] text-sm" title={row.question_text}>
            {row.question_text}
          </span>
        ),
      },
      {
        header: "Tipe",
        accessor: "question_type" as keyof Row,
        headerClassName:
          "px-4 py-3 text-center text-xs font-medium text-outline uppercase tracking-wider",
        className: "px-4 py-3 text-center text-sm text-on-surface",
        render: (_value: Row[keyof Row], row: Row) =>
          TYPE_LABEL[row.question_type] ?? row.question_type,
      },
      {
        header: "Poin",
        accessor: "points" as keyof Row,
        headerClassName:
          "px-4 py-3 text-center text-xs font-medium text-outline uppercase tracking-wider",
        className: "px-4 py-3 text-center text-sm text-on-surface",
      },
      {
        header: "Jumlah Opsi",
        accessor: "option_count" as keyof Row,
        headerClassName:
          "px-4 py-3 text-center text-xs font-medium text-outline uppercase tracking-wider",
        className: "px-4 py-3 text-center text-sm text-on-surface",
      },
      {
        header: "Status",
        accessor: "excel_row" as keyof Row,
        headerClassName:
          "px-4 py-3 text-center text-xs font-medium text-outline uppercase tracking-wider",
        className: "px-4 py-3 text-center text-sm text-on-surface",
        render: () => (
          <Badge variant="success" className="px-2.5 py-1 text-xs leading-4">
            Valid
          </Badge>
        ),
      },
    ];
  }, []);

  const canImport = Boolean(
    preview && preview.invalid_rows === 0 && file && subjectId && !busy,
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import Soal"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Batal
          </Button>
          <Button onClick={handleImport} loading={importing} disabled={!canImport}>
            Import Soal
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <FormField
          label="Mata Pelajaran"
          required
          hint="Soal akan diimpor ke mata pelajaran ini."
          error={fieldErrors.subject_id?.[0]}
        >
          <AppSelect
            value={subjectId}
            onChange={handleSubjectChange}
            options={subjectOptions}
            placeholder="Pilih Mata Pelajaran"
            isDisabled={busy}
          />
        </FormField>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3">
          <div>
            <p className="text-sm font-medium text-on-surface">Template Import</p>
            <p className="text-xs text-outline">
              Unduh template XLSX lalu isi sesuai header yang tersedia.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleDownloadTemplate}
            loading={downloadLoading}
            disabled={busy}
          >
            Download Template
          </Button>
        </div>

        <FormField
          label="File XLSX"
          required
          hint="Format .xlsx, maksimal 5 MB."
          error={fieldErrors.file?.[0]}
        >
          <label
            htmlFor="question-import-file"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest px-4 py-6 text-sm text-on-surface-variant transition-colors hover:border-primary-container hover:text-primary-container"
          >
            <FileSpreadsheet className="h-5 w-5" />
            <span className="truncate">{file ? file.name : "Pilih file .xlsx"}</span>
          </label>
          <input
            id="question-import-file"
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={handleFileChange}
            disabled={busy}
          />
        </FormField>

        <div>
          <Button
            type="button"
            variant="secondary"
            onClick={handlePreview}
            loading={previewLoading}
            disabled={!subjectId || !file || importing || downloadLoading}
          >
            Preview &amp; Validasi
          </Button>
        </div>

        {errorMessage && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {errorMessage}
          </p>
        )}

        {preview && (
          <div className="rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm">
            <p className="font-medium text-on-surface">
              {preview.valid_rows} baris valid
              {preview.invalid_rows > 0 && `, ${preview.invalid_rows} baris bermasalah`}
            </p>
            <p className="text-xs text-outline">Total {preview.total_rows} baris.</p>
          </div>
        )}

        {preview && preview.preview.length > 0 && (
          <DataTable
            columns={columns}
            data={preview.preview}
            emptyMessage="Tidak ada baris untuk ditampilkan."
          />
        )}

        {groupedErrors.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-error">Validasi per baris</p>
            <div className="max-h-64 space-y-3 overflow-y-auto rounded-2xl border border-error/30 bg-error-container/40 p-3">
              {groupedErrors.map(([row, errors]) => (
                <div key={row} className="text-sm">
                  <p className="font-semibold text-on-surface">Baris {row}</p>
                  <ul className="mt-0.5 list-disc pl-5 text-error">
                    {errors.map((error, index) => (
                      <li key={`${error.field}-${index}`}>
                        <span className="font-medium">{error.field}</span>: {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
