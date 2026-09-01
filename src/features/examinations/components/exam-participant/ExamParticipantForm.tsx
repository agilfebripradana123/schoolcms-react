import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { studentService } from "@/features/students/api/student.service";
import type { Student } from "@/features/students/api/types";
import { examService } from "../../api/exam.service";
import type {
  CreateExamParticipantPayload,
  Exam,
  ExamParticipant,
  ExamParticipantStatus,
} from "../../api/types";
import { examParticipantService } from "../../api/exam-participant.service";

interface ExamParticipantFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: ExamParticipant | null;
}

const STATUS_OPTIONS: { value: ExamParticipantStatus; label: string }[] = [
  { value: "registered", label: "Terdaftar" },
  { value: "started", label: "Dimulai" },
  { value: "completed", label: "Selesai" },
  { value: "blocked", label: "Diblokir" },
];

export default function ExamParticipantForm({
  open,
  onClose,
  onSaved,
  initialData,
}: ExamParticipantFormProps) {
  const [examId, setExamId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [cardNumber, setCardNumber] = useState("");
  const [status, setStatus] = useState<ExamParticipantStatus>("registered");
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState("");
  const [loginAllowed, setLoginAllowed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [exams, setExams] = useState<Exam[]>([]);
  const [examsError, setExamsError] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsError, setStudentsError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadExams = useCallback(() => {
    setExamsError(false);
    examService
      .list({ per_page: 100, status: "published" })
      .then((res) => setExams(res.data))
      .catch(() => setExamsError(true));
  }, []);

  const loadStudents = useCallback(() => {
    setStudentsError(false);
    studentService
      .list({ per_page: 100 })
      .then((res) => setStudents(res.data))
      .catch(() => setStudentsError(true));
  }, []);

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});
      loadExams();
      loadStudents();

      if (initialData) {
        setExamId(String(initialData.exam_id));
        setStudentId(String(initialData.student_id));
        setCardNumber(initialData.exam_card_number);
        setStatus(initialData.status);
        setIsBlocked(initialData.is_blocked);
        setBlockedReason(initialData.blocked_reason ?? "");
        setLoginAllowed(initialData.login_allowed);
      } else {
        setExamId("");
        setStudentId("");
        setCardNumber("");
        setStatus("registered");
        setIsBlocked(false);
        setBlockedReason("");
        setLoginAllowed(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateExamParticipantPayload = {
      exam_id: Number(examId),
      student_id: Number(studentId),
      exam_card_number: cardNumber.trim(),
      status,
      is_blocked: isBlocked,
      blocked_reason: isBlocked && blockedReason.trim() ? blockedReason.trim() : null,
      login_allowed: loginAllowed,
    };

    try {
      if (initialData) {
        await examParticipantService.update(initialData.id, payload);
        toast.success("Peserta ujian berhasil diperbarui.");
      } else {
        await examParticipantService.create(payload);
        toast.success("Peserta ujian berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan peserta ujian", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const examOptions = exams.map((exam) => ({
    value: String(exam.id),
    label: exam.title,
  }));

  const studentOptions = students.map((s) => ({
    value: String(s.id),
    label: s.name,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Peserta Ujian" : "Tambah Peserta Ujian"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="exam-participant-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="exam-participant-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Ujian" required error={fieldErrors.exam_id?.[0]}>
            {examsError ? (
              <div className="flex w-full items-center justify-between gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data ujian.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadExams}
                >
                  Muat Ulang
                </Button>
              </div>
            ) : exams.length === 0 && !examsError ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Memuat data...
              </p>
            ) : (
              <AppSelect
                value={examId}
                onChange={(v) => setExamId(v ?? "")}
                options={examOptions}
                placeholder="Pilih Ujian"
                isDisabled={submitting}
              />
            )}
          </FormField>

          <FormField label="Siswa" required error={fieldErrors.student_id?.[0]}>
            {studentsError ? (
              <div className="flex w-full items-center justify-between gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data siswa.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadStudents}
                >
                  Muat Ulang
                </Button>
              </div>
            ) : students.length === 0 && !studentsError ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Memuat data...
              </p>
            ) : (
              <AppSelect
                value={studentId}
                onChange={(v) => setStudentId(v ?? "")}
                options={studentOptions}
                placeholder="Pilih Siswa"
                isDisabled={submitting}
              />
            )}
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="No. Kartu Ujian"
            required
            error={fieldErrors.exam_card_number?.[0]}
          >
            <Input
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="EXAM-2026-0001"
              maxLength={30}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Status" required error={fieldErrors.status?.[0]}>
            <AppSelect
              value={status}
              onChange={(v) => setStatus((v ?? "registered") as ExamParticipantStatus)}
              options={STATUS_OPTIONS}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              checked={isBlocked}
              onChange={(e) => setIsBlocked(e.target.checked)}
              disabled={submitting}
              className="h-4 w-4 rounded border-slate-300 text-primary-container focus:ring-primary-container"
            />
            <span className="text-sm font-semibold text-on-surface">Diblokir</span>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              checked={loginAllowed}
              onChange={(e) => setLoginAllowed(e.target.checked)}
              disabled={submitting}
              className="h-4 w-4 rounded border-slate-300 text-primary-container focus:ring-primary-container"
            />
            <span className="text-sm font-semibold text-on-surface">Login Diizinkan</span>
          </label>
        </div>

        {isBlocked && (
          <FormField label="Alasan Blokir" error={fieldErrors.blocked_reason?.[0]}>
            <Textarea
              value={blockedReason}
              onChange={(e) => setBlockedReason(e.target.value)}
              placeholder="Alasan pemblokiran peserta"
              rows={2}
              disabled={submitting}
            />
          </FormField>
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
