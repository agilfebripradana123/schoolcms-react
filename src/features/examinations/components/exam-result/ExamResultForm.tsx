import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { examParticipantService } from "../../api/exam-participant.service";
import type {
  CreateExamResultPayload,
  ExamParticipant,
  ExamResult,
  ExamResultStatus,
} from "../../api/types";
import { examResultService } from "../../api/exam-result.service";

interface ExamResultFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: ExamResult | null;
}

const STATUS_OPTIONS: { value: ExamResultStatus; label: string }[] = [
  { value: "pending", label: "Menunggu" },
  { value: "graded", label: "Dinilai" },
];

function participantLabel(p: ExamParticipant): string {
  const student = p.student?.name;
  const exam = p.exam?.title;
  if (student && exam) return `${student} — ${exam}`;
  if (student) return student;
  if (p.exam_card_number) return p.exam_card_number;
  return `#${p.id}`;
}

export default function ExamResultForm({
  open,
  onClose,
  onSaved,
  initialData,
}: ExamResultFormProps) {
  const [participantId, setParticipantId] = useState<string>("");
  const [totalScore, setTotalScore] = useState<string>("");
  const [correctCount, setCorrectCount] = useState<string>("");
  const [wrongCount, setWrongCount] = useState<string>("");
  const [unansweredCount, setUnansweredCount] = useState<string>("");
  const [grade, setGrade] = useState("");
  const [status, setStatus] = useState<ExamResultStatus>("pending");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [participants, setParticipants] = useState<ExamParticipant[]>([]);
  const [participantsError, setParticipantsError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadParticipants = useCallback(() => {
    setParticipantsError(false);
    examParticipantService
      .list({ per_page: 100 })
      .then((res) => setParticipants(res.data))
      .catch(() => setParticipantsError(true));
  }, []);

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});
      loadParticipants();

      if (initialData) {
        setParticipantId(String(initialData.participant_id));
        setTotalScore(initialData.total_score != null ? String(initialData.total_score) : "");
        setCorrectCount(initialData.correct_count != null ? String(initialData.correct_count) : "");
        setWrongCount(initialData.wrong_count != null ? String(initialData.wrong_count) : "");
        setUnansweredCount(
          initialData.unanswered_count != null ? String(initialData.unanswered_count) : "",
        );
        setGrade(initialData.grade ?? "");
        setStatus(initialData.status);
      } else {
        setParticipantId("");
        setTotalScore("");
        setCorrectCount("");
        setWrongCount("");
        setUnansweredCount("");
        setGrade("");
        setStatus("pending");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateExamResultPayload = {
      participant_id: Number(participantId),
      total_score: totalScore === "" ? undefined : Number(totalScore),
      correct_count: correctCount === "" ? undefined : Number(correctCount),
      wrong_count: wrongCount === "" ? undefined : Number(wrongCount),
      unanswered_count: unansweredCount === "" ? undefined : Number(unansweredCount),
      grade: grade.trim() || null,
      status,
    };

    try {
      if (initialData) {
        await examResultService.update(initialData.id, payload);
        toast.success("Hasil ujian berhasil diperbarui.");
      } else {
        await examResultService.create(payload);
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

  const participantOptions = participants.map((p) => ({
    value: String(p.id),
    label: participantLabel(p),
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Hasil Ujian" : "Tambah Hasil Ujian"}
      size="lg"
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
        <FormField label="Peserta" required error={fieldErrors.participant_id?.[0]}>
          {participantsError ? (
            <div className="flex w-full items-center justify-between gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
              <span>Gagal memuat data peserta.</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={loadParticipants}
              >
                Muat Ulang
              </Button>
            </div>
          ) : participants.length === 0 && !participantsError ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
              Memuat data...
            </p>
          ) : (
            <AppSelect
              value={participantId}
              onChange={(v) => setParticipantId(v ?? "")}
              options={participantOptions}
              placeholder="Pilih Peserta"
              isDisabled={submitting}
            />
          )}
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <FormField label="Total Nilai" error={fieldErrors.total_score?.[0]}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={totalScore}
              onChange={(e) => setTotalScore(e.target.value)}
              placeholder="0"
              disabled={submitting}
            />
          </FormField>

          <FormField label="Benar" error={fieldErrors.correct_count?.[0]}>
            <Input
              type="number"
              min={0}
              step={1}
              value={correctCount}
              onChange={(e) => setCorrectCount(e.target.value)}
              placeholder="0"
              disabled={submitting}
            />
          </FormField>

          <FormField label="Salah" error={fieldErrors.wrong_count?.[0]}>
            <Input
              type="number"
              min={0}
              step={1}
              value={wrongCount}
              onChange={(e) => setWrongCount(e.target.value)}
              placeholder="0"
              disabled={submitting}
            />
          </FormField>

          <FormField label="Tidak Dijawab" error={fieldErrors.unanswered_count?.[0]}>
            <Input
              type="number"
              min={0}
              step={1}
              value={unansweredCount}
              onChange={(e) => setUnansweredCount(e.target.value)}
              placeholder="0"
              disabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="Grade"
            hint="Opsional, mis. A, B, C, dll."
            error={fieldErrors.grade?.[0]}
          >
            <Input
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="A"
              maxLength={5}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Status" required error={fieldErrors.status?.[0]}>
            <AppSelect
              value={status}
              onChange={(v) => setStatus((v ?? "pending") as ExamResultStatus)}
              options={STATUS_OPTIONS}
              isSearchable={false}
              isDisabled={submitting}
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
