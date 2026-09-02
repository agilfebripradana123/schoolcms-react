import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { counselingService } from "../../api/counseling.service";
import {
  type Counseling,
  type CreateCounselingPayload,
  type CounselingStatus,
} from "../../api/types";
import { studentService } from "@/features/students/api/student.service";
import type { Student } from "@/features/students/api/types";
import { teacherService } from "@/features/teachers-staff/api/teacher.service";
import { formatTeacherName, type Teacher } from "@/features/teachers-staff/api/types";

const STATUS_OPTIONS = [
  { value: "terjadwal", label: "Terjadwal" },
  { value: "selesai", label: "Selesai" },
  { value: "dibatalkan", label: "Dibatalkan" },
] as const satisfies { value: CounselingStatus; label: string }[];

interface CounselingFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Counseling | null;
}

export default function CounselingForm({
  open,
  onClose,
  onSaved,
  initialData,
}: CounselingFormProps) {
  const [studentId, setStudentId] = useState<string>("");
  const [counselorId, setCounselorId] = useState<string>("");
  const [counselingDate, setCounselingDate] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [status, setStatus] = useState<CounselingStatus>("terjadwal");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(false);

  const [counselors, setCounselors] = useState<Teacher[]>([]);
  const [counselorsLoading, setCounselorsLoading] = useState(false);
  const [counselorsError, setCounselorsError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadStudents = useCallback(() => {
    setStudentsLoading(true);
    setStudentsError(false);
    studentService
      .list({ per_page: 100 })
      .then((res) => {
        setStudents(res.data);
        setStudentsError(false);
      })
      .catch(() => {
        setStudentsError(true);
      })
      .finally(() => {
        setStudentsLoading(false);
      });
  }, []);

  const loadCounselors = useCallback(() => {
    setCounselorsLoading(true);
    setCounselorsError(false);
    teacherService
      .list({ per_page: 100 })
      .then((res) => {
        setCounselors(res.data);
        setCounselorsError(false);
      })
      .catch(() => {
        setCounselorsError(true);
      })
      .finally(() => {
        setCounselorsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});
      loadStudents();
      loadCounselors();

      if (initialData) {
        setStudentId(String(initialData.student_id));
        setCounselorId(String(initialData.counselor_id));
        setCounselingDate(initialData.counseling_date);
        setTopic(initialData.topic);
        setNotes(initialData.notes ?? "");
        setFollowUp(initialData.follow_up ?? "");
        setStatus(initialData.status);
      } else {
        setStudentId("");
        setCounselorId("");
        setCounselingDate("");
        setTopic("");
        setNotes("");
        setFollowUp("");
        setStatus("terjadwal");
      }
    }
  }, [open, initialData, loadStudents, loadCounselors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateCounselingPayload = {
      student_id: Number(studentId),
      counselor_id: Number(counselorId),
      counseling_date: counselingDate,
      topic,
      notes: notes || null,
      follow_up: followUp || null,
      status,
    };

    try {
      if (initialData) {
        await counselingService.update(initialData.id, payload);
        toast.success("Data bimbingan berhasil diperbarui.");
      } else {
        await counselingService.create(payload);
        toast.success("Data bimbingan berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan data bimbingan", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const studentOptions = students.map((s) => ({
    value: String(s.id),
    label: s.name + (s.nisn ? ` (${s.nisn})` : ""),
  }));
  const counselorOptions = counselors.map((t) => ({
    value: String(t.id),
    label: formatTeacherName(t),
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Data Bimbingan" : "Tambah Data Bimbingan"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="counseling-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="counseling-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Siswa" required error={fieldErrors.student_id?.[0]}>
            {studentsLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat siswa...
              </div>
            ) : studentsError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data siswa.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadStudents}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : students.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada siswa tersedia.
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

          <FormField label="Konselor" required error={fieldErrors.counselor_id?.[0]}>
            {counselorsLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat konselor...
              </div>
            ) : counselorsError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data konselor.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadCounselors}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : counselors.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada konselor tersedia.
              </p>
            ) : (
              <AppSelect
                value={counselorId}
                onChange={(v) => setCounselorId(v ?? "")}
                options={counselorOptions}
                placeholder="Pilih Konselor"
                isDisabled={submitting}
              />
            )}
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="Tanggal Bimbingan"
            required
            error={fieldErrors.counseling_date?.[0]}
            hint="Format: YYYY-MM-DD"
          >
            <Input
              type="date"
              value={counselingDate}
              onChange={(e) => setCounselingDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Status"
            required
            error={fieldErrors.status?.[0]}
          >
            <AppSelect
              value={status}
              onChange={(v) => setStatus((v ?? "terjadwal") as CounselingStatus)}
              options={STATUS_OPTIONS}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>
        </div>

        <FormField
          label="Topik / Masalah"
          required
          error={fieldErrors.topic?.[0]}
          hint="Maksimal 200 karakter"
        >
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Contoh: Kesulitan belajar Matematika"
            maxLength={200}
            disabled={submitting}
          />
        </FormField>

        <FormField label="Catatan" error={fieldErrors.notes?.[0]}>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan detail sesi bimbingan..."
            disabled={submitting}
            rows={4}
          />
        </FormField>

        <FormField label="Tindak Lanjut" error={fieldErrors.follow_up?.[0]}>
          <Textarea
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            placeholder="Rencana tindak lanjut atau rekomendasi..."
            disabled={submitting}
            rows={4}
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