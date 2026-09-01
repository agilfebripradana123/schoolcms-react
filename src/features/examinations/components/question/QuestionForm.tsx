import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { subjectService } from "@/features/academic/api/subject.service";
import type { Subject } from "@/features/academic/api/types";
import { questionBankService } from "../../api/question.service";
import { examInstructionService } from "../../api/exam-instruction.service";
import type {
  CreateQuestionPayload,
  ExamInstruction,
  QuestionBank,
  QuestionDifficulty,
  QuestionType,
} from "../../api/types";

interface QuestionFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: QuestionBank | null;
}

interface OptionDraft {
  id: string;
  option_text: string;
  option_image: string;
  is_correct: boolean;
}

const TYPE_OPTIONS = [
  { value: "multiple_choice", label: "Pilihan Ganda" },
  { value: "true_false", label: "Benar/Salah" },
  { value: "essay", label: "Esai" },
];

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Mudah" },
  { value: "medium", label: "Sedang" },
  { value: "hard", label: "Sulit" },
];

let optionCounter = 0;

function createEmptyOption(): OptionDraft {
  optionCounter += 1;
  return {
    id: `opt-${optionCounter}`,
    option_text: "",
    option_image: "",
    is_correct: false,
  };
}

export default function QuestionForm({
  open,
  onClose,
  onSaved,
  initialData,
}: QuestionFormProps) {
  const [subjectId, setSubjectId] = useState<string>("");
  const [instructionId, setInstructionId] = useState<string>("");
  const [questionText, setQuestionText] = useState("");
  const [questionImage, setQuestionImage] = useState("");
  const [type, setType] = useState<QuestionType>("multiple_choice");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("easy");
  const [explanation, setExplanation] = useState("");
  const [points, setPoints] = useState<string>("");
  const [options, setOptions] = useState<OptionDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsError, setSubjectsError] = useState(false);
  const [instructions, setInstructions] = useState<ExamInstruction[]>([]);
  const [instructionsError, setInstructionsError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadSubjects = useCallback(() => {
    setSubjectsError(false);
    subjectService
      .list()
      .then((res) => setSubjects(res.data))
      .catch(() => setSubjectsError(true));
  }, []);

  const loadInstructions = useCallback(() => {
    setInstructionsError(false);
    examInstructionService
      .list({ per_page: 100 })
      .then((res) => setInstructions(res.data))
      .catch(() => setInstructionsError(true));
  }, []);

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});
      loadSubjects();
      loadInstructions();

      if (initialData) {
        setSubjectId(String(initialData.subject_id));
        setInstructionId(
          initialData.instruction_id != null ? String(initialData.instruction_id) : "",
        );
        setQuestionText(initialData.question_text);
        setQuestionImage(initialData.question_image ?? "");
        setType(initialData.type);
        setDifficulty(initialData.difficulty);
        setExplanation(initialData.explanation ?? "");
        setPoints(String(initialData.points));
        setOptions(
          (initialData.options ?? []).map((o) => ({
            id: `opt-${++optionCounter}`,
            option_text: o.option_text,
            option_image: o.option_image ?? "",
            is_correct: Boolean(o.is_correct),
          })),
        );
      } else {
        setSubjectId("");
        setInstructionId("");
        setQuestionText("");
        setQuestionImage("");
        setType("multiple_choice");
        setDifficulty("easy");
        setExplanation("");
        setPoints("");
        setOptions([createEmptyOption(), createEmptyOption()]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const handleTypeChange = (value: string | null, isReset = false) => {
    const nextType = (value ?? "multiple_choice") as QuestionType;
    setType(nextType);
    if (isReset || nextType === "essay") {
      if (nextType === "essay") {
        setOptions([]);
      } else {
        setOptions([createEmptyOption(), createEmptyOption()]);
      }
    } else {
      setOptions((prev) => {
        if (nextType === "true_false" && prev.length > 2) {
          return prev.slice(0, 2);
        }
        if (prev.length < 2) {
          const next = [...prev];
          while (next.length < 2) next.push(createEmptyOption());
          return next;
        }
        return prev;
      });
    }
  };

  const updateOption = (id: string, patch: Partial<OptionDraft>) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  };

  const toggleCorrect = (id: string) => {
    setOptions((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, is_correct: !o.is_correct } : o,
      ),
    );
  };

  const addOption = () => {
    setOptions((prev) => [...prev, createEmptyOption()]);
  };

  const removeOption = (id: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const isEssay = type === "essay";
    const optionPayloads = options.map((o) => ({
      option_text: o.option_text.trim(),
      option_image: o.option_image.trim() || null,
      is_correct: o.is_correct,
    }));

    const payload: CreateQuestionPayload = {
      subject_id: Number(subjectId),
      instruction_id: instructionId ? Number(instructionId) : null,
      question_text: questionText.trim(),
      question_image: questionImage.trim() || null,
      type,
      difficulty,
      explanation: explanation.trim() || null,
      points: Number(points || 0),
      options: isEssay ? [] : optionPayloads,
    };

    try {
      if (initialData) {
        await questionBankService.update(initialData.id, payload);
        toast.success("Soal berhasil diperbarui.");
      } else {
        await questionBankService.create(payload);
        toast.success("Soal berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan soal", {
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
  const instructionOptions = instructions.map((i) => ({
    value: String(i.id),
    label: i.title,
  }));

  const requireOptions = type === "multiple_choice" || type === "true_false";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Soal" : "Tambah Soal"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="question-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="question-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

          <FormField
            label="Instruksi"
            hint="Opsional."
            error={fieldErrors.instruction_id?.[0]}
          >
            {instructionsError ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat instruksi.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadInstructions}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : (
              <AppSelect
                value={instructionId}
                onChange={(v) => setInstructionId(v ?? "")}
                options={instructionOptions}
                placeholder="Pilih Instruksi (opsional)"
                isClearable
                isDisabled={submitting}
              />
            )}
          </FormField>
        </div>

        <FormField label="Teks Soal" required error={fieldErrors.question_text?.[0]}>
          <Textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Tuliskan teks soal..."
            maxLength={10000}
            disabled={submitting}
          />
        </FormField>

        <FormField
          label="Gambar Soal"
          hint="Opsional. URL gambar soal."
          error={fieldErrors.question_image?.[0]}
        >
          <Input
            value={questionImage}
            onChange={(e) => setQuestionImage(e.target.value)}
            placeholder="https://contoh.com/gambar-soal.png"
            maxLength={255}
            disabled={submitting}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FormField label="Tipe Soal" required error={fieldErrors.type?.[0]}>
            <AppSelect
              value={type}
              onChange={(v) => handleTypeChange(v)}
              options={TYPE_OPTIONS}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>

          <FormField label="Kesulitan" required error={fieldErrors.difficulty?.[0]}>
            <AppSelect
              value={difficulty}
              onChange={(v) => setDifficulty((v ?? "easy") as QuestionDifficulty)}
              options={DIFFICULTY_OPTIONS}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>

          <FormField label="Bobot" required error={fieldErrors.points?.[0]}>
            <Input
              type="number"
              min={1}
              max={1000}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="5"
              disabled={submitting}
            />
          </FormField>
        </div>

        {requireOptions && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Pilihan Jawaban
                  <span className="ml-0.5 text-error">*</span>
                </p>
                <p className="text-xs text-outline">
                  {type === "true_false"
                    ? "Membutuhkan tepat 2 pilihan (Benar/Salah)."
                    : "Membutuhkan minimal 2 pilihan."}
                </p>
                <p className="text-xs text-outline">
                  Tandai pilihan yang merupakan jawaban benar.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleTypeChange.bind(null, type, true)}
                disabled={submitting}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reset
              </Button>
            </div>

            {fieldErrors.options?.[0] && (
              <p className="mb-2 text-xs text-error">{fieldErrors.options[0]}</p>
            )}

            <div className="space-y-3">
              {options.map((option, index) => (
                <div
                  key={option.id}
                  className="rounded-2xl border border-slate-200 bg-surface-container-lowest p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-on-surface-variant">
                      Pilihan {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeOption(option.id)}
                      disabled={submitting}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-error-container hover:text-error disabled:opacity-50"
                      aria-label={`Hapus pilihan ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>

                  <div className="flex items-start gap-3">
                    <label className="mt-3 flex flex-shrink-0 items-center gap-2 text-sm text-on-surface">
                      <input
                        type="checkbox"
                        checked={option.is_correct}
                        onChange={() => toggleCorrect(option.id)}
                        disabled={submitting}
                        className="h-4 w-4 accent-[#7c3aed]"
                      />
                      Benar
                    </label>
                    <div className="min-w-0 flex-1 space-y-2">
                      <Input
                        value={option.option_text}
                        onChange={(e) =>
                          updateOption(option.id, { option_text: e.target.value })
                        }
                        placeholder="Teks pilihan jawaban"
                        maxLength={5000}
                        disabled={submitting}
                      />
                      <Input
                        value={option.option_image}
                        onChange={(e) =>
                          updateOption(option.id, { option_image: e.target.value })
                        }
                        placeholder="URL gambar pilihan (opsional)"
                        maxLength={255}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addOption}
                disabled={submitting}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Tambah Pilihan
              </Button>
            </div>
          </div>
        )}

        <FormField
          label="Penjelasan"
          hint="Opsional. Penjelasan kunci jawaban."
          error={fieldErrors.explanation?.[0]}
        >
          <Textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Penjelasan kunci jawaban soal..."
            maxLength={10000}
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
