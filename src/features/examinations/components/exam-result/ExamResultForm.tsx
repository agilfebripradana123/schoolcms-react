import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { examAttemptService } from "../../api/exam-attempt.service";
import type { ExamAttemptOption, ExamResult } from "../../api/types";
import { examResultService } from "../../api/exam-result.service";

interface ExamResultFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: ExamResult | null;
}

function attemptLabel(a: ExamAttemptOption): string {
  const student = a.participant?.student?.name;
  const exam = a.exam?.title;
  const segments = [`Percobaan #${a.attempt_number}`];
  if (student && a.participant?.student?.nis) {
    segments.push(`${student} (${a.participant.student.nis})`);
  } else if (student) {
    segments.push(student);
  }
  if (exam) segments.push(exam);
  segments.push(a.status === "submitted" ? "Selesai" : "Waktu Habis");
  return segments.join(" · ");
}

export default function ExamResultForm({
  open,
  onClose,
  onSaved,
  initialData,
}: ExamResultFormProps) {
  const [attemptId, setAttemptId] = useState<string>("");
  const [attempts, setAttempts] = useState<ExamAttemptOption[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [attemptsError, setAttemptsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isEdit = Boolean(initialData);

  const loadAttempts = useCallback(() => {
    if (isEdit) return;
    setAttemptsError(false);
    setLoadingAttempts(true);
    examAttemptService
      .listEligible({ per_page: 200 })
      .then((res) => setAttempts(res.data))
      .catch(() => setAttemptsError(true))
      .finally(() => setLoadingAttempts(false));
  }, [isEdit]);

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});
      setAttemptId("");
      loadAttempts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const eligibleOptions = attempts.filter((a) => !a.has_result);
  const attemptOptions = eligibleOptions.map((a) => ({
    value: String(a.id),
    label: attemptLabel(a),
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    if (!isEdit && !attemptId) {
      setError({ message: "Pilih attempt terlebih dahulu." });
      setSubmitting(false);
      return;
    }

    try {
      if (initialData) {
        // Update recomputes the bound attempt through the authoritative
        // scoring service; no manual score fields exist.
        await examResultService.update(initialData.id, {});
        toast.success("Hasil ujian berhasil dihitung ulang.");
      } else {
        await examResultService.create({ exam_attempt_id: Number(attemptId) });
        toast.success("Hasil ujian berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan hasil ujian", {
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
      title={isEdit ? "Edit Hasil Ujian" : "Tambah Hasil Ujian"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="exam-result-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="exam-result-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        {isEdit && initialData ? (
          <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            <p>
              Attempt:{" "}
              <span className="font-semibold text-on-surface">
                {initialData.attempt_number != null
                  ? `Percobaan #${initialData.attempt_number}`
                  : initialData.exam_attempt_id != null
                    ? `#${initialData.exam_attempt_id}`
                    : "Legacy"}
              </span>
            </p>
            {initialData.is_final === true && (
              <p className="mt-1 font-medium text-error">
                Status: Final — hasil dikunci dan tidak dapat dihitung ulang.
              </p>
            )}
            {initialData.is_effective === true && (
              <p className="mt-1">
                Status: hasil efektif peserta.
              </p>
            )}
            {initialData.exam_attempt_id == null && (
              <p className="mt-1">
                Status: Legacy (tanpa attempt) — tidak dapat dihitung ulang.
              </p>
            )}
            <p className="mt-1">
              Nilai dihitung ulang oleh sistem saat disimpan. Input manual skor
              tidak didukung.
            </p>
          </div>
        ) : (
          <FormField label="Attempt Ujian" required error={fieldErrors.exam_attempt_id?.[0]}>
            {attemptsError ? (
              <div className="flex w-full items-center justify-between gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat daftar attempt.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadAttempts}
                >
                  Muat Ulang
                </Button>
              </div>
            ) : (
              <AppSelect
                value={attemptId}
                onChange={(v) => setAttemptId(v ?? "")}
                options={attemptOptions}
                placeholder="Pilih attempt yang sudah selesai"
                isSearchable
                isLoading={loadingAttempts}
                noOptionsMessage={
                  loadingAttempts
                    ? "Memuat data..."
                    : attempts.length === 0
                      ? "Belum ada attempt yang tersedia."
                      : "Semua attempt yang tersedia sudah memiliki hasil."
                }
                isDisabled={submitting}
              />
            )}
          </FormField>
        )}

        {!isEdit && (
          <p className="rounded-xl bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">
            Nilai hasil dihitung otomatis oleh sistem berdasarkan attempt yang
            dipilih. Input manual skor tidak didukung.
          </p>
        )}

        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}