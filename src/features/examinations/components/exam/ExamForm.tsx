import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { subjectService } from "@/features/academic/api/subject.service";
import type { Subject } from "@/features/academic/api/types";
import { examService } from "../../api/exam.service";
import type { CreateExamPayload, Exam, ExamStatus } from "../../api/types";

interface ExamFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Exam | null;
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "ongoing", label: "Berlangsung" },
  { value: "completed", label: "Selesai" },
  { value: "archived", label: "Diarsipkan" },
];

export default function ExamForm({
  open,
  onClose,
  onSaved,
  initialData,
}: ExamFormProps) {
  const [subjectId, setSubjectId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<string>("");
  const [totalQuestions, setTotalQuestions] = useState<string>("");
  const [passingScore, setPassingScore] = useState<string>("");
  const [maxAttempts, setMaxAttempts] = useState<string>("");
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [showResult, setShowResult] = useState(true);
  const [status, setStatus] = useState<ExamStatus>("draft");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsError, setSubjectsError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadSubjects = useCallback(() => {
    setSubjectsError(false);
    subjectService
      .list()
      .then((res) => setSubjects(res.data))
      .catch(() => setSubjectsError(true));
  }, []);

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});
      loadSubjects();

      if (initialData) {
        setSubjectId(String(initialData.subject_id));
        setTitle(initialData.title);
        setDescription(initialData.description ?? "");
        setDurationMinutes(String(initialData.duration_minutes));
        setTotalQuestions(String(initialData.total_questions ?? ""));
        setPassingScore(String(initialData.passing_score ?? ""));
        setMaxAttempts(String(initialData.max_attempts ?? ""));
        setShuffleQuestions(initialData.shuffle_questions);
        setShuffleOptions(initialData.shuffle_options);
        setShowResult(initialData.show_result);
        setStatus(initialData.status);
      } else {
        setSubjectId("");
        setTitle("");
        setDescription("");
        setDurationMinutes("");
        setTotalQuestions("");
        setPassingScore("");
        setMaxAttempts("");
        setShuffleQuestions(true);
        setShuffleOptions(true);
        setShowResult(true);
        setStatus("draft");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateExamPayload = {
      subject_id: Number(subjectId),
      title: title.trim(),
      description: description.trim() || null,
      duration_minutes: Number(durationMinutes || 0),
      total_questions: totalQuestions === "" ? undefined : Number(totalQuestions),
      passing_score: passingScore === "" ? undefined : Number(passingScore),
      max_attempts: maxAttempts === "" ? undefined : Number(maxAttempts),
      shuffle_questions: shuffleQuestions,
      shuffle_options: shuffleOptions,
      show_result: showResult,
      status,
    };

    try {
      if (initialData) {
        await examService.update(initialData.id, payload);
        toast.success("Ujian berhasil diperbarui.");
      } else {
        await examService.create(payload);
        toast.success("Ujian berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan ujian", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const subjectOptions = subjects.map((s) => ({
    value: String(s.id),
    label: s.name,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Ujian" : "Tambah Ujian"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="exam-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="exam-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <FormField label="Judul Ujian" required error={fieldErrors.title?.[0]}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ujian Akhir Semester"
            maxLength={200}
            disabled={submitting}
          />
        </FormField>

        <FormField label="Mata Pelajaran" required error={fieldErrors.subject_id?.[0]}>
          {subjectsError ? (
            <div className="flex w-full items-center gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
              <span>Gagal memuat data mata pelajaran.</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={loadSubjects}
                className="self-start"
              >
                Muat Ulang
              </Button>
            </div>
          ) : subjects.length === 0 && !subjectsError ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
              Memuat data...
            </p>
          ) : (
            <AppSelect
              value={subjectId}
              onChange={(v) => setSubjectId(v ?? "")}
              options={subjectOptions}
              placeholder="Pilih Mata Pelajaran"
              isDisabled={submitting}
            />
          )}
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="Durasi (menit)"
            required
            error={fieldErrors.duration_minutes?.[0]}
          >
            <Input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="60"
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Jumlah Soal"
            hint="Opsional."
            error={fieldErrors.total_questions?.[0]}
          >
            <Input
              type="number"
              min={0}
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(e.target.value)}
              placeholder="10"
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Nilai Lulus"
            hint="0-100."
            error={fieldErrors.passing_score?.[0]}
          >
            <Input
              type="number"
              min={0}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(e.target.value)}
              placeholder="70"
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Maksimal Percobaan"
            hint="Opsional."
            error={fieldErrors.max_attempts?.[0]}
          >
            <Input
              type="number"
              min={1}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              placeholder="1"
              disabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              checked={shuffleQuestions}
              onChange={(e) => setShuffleQuestions(e.target.checked)}
              disabled={submitting}
              className="h-4 w-4 rounded border-slate-300 text-primary-container focus:ring-primary-container"
            />
            <span className="text-sm font-semibold text-on-surface">Acak Soal</span>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              checked={shuffleOptions}
              onChange={(e) => setShuffleOptions(e.target.checked)}
              disabled={submitting}
              className="h-4 w-4 rounded border-slate-300 text-primary-container focus:ring-primary-container"
            />
            <span className="text-sm font-semibold text-on-surface">Acak Pilihan</span>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              checked={showResult}
              onChange={(e) => setShowResult(e.target.checked)}
              disabled={submitting}
              className="h-4 w-4 rounded border-slate-300 text-primary-container focus:ring-primary-container"
            />
            <span className="text-sm font-semibold text-on-surface">Tampilkan Hasil</span>
          </label>
        </div>

        <FormField label="Status" required error={fieldErrors.status?.[0]}>
          <AppSelect
            value={status}
            onChange={(v) => setStatus((v ?? "draft") as ExamStatus)}
            options={STATUS_OPTIONS}
            isSearchable={false}
            isDisabled={submitting}
          />
        </FormField>

        <FormField
          label="Deskripsi"
          hint="Opsional."
          error={fieldErrors.description?.[0]}
        >
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi ujian"
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
