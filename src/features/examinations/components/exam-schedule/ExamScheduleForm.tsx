import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { roomService } from "@/features/facilities/api";
import type { Room } from "@/features/facilities/api";
import { examService } from "../../api/exam.service";
import { examSessionService } from "../../api/exam-session.service";
import { examScheduleService } from "../../api/exam-schedule.service";
import type {
  CreateExamSchedulePayload,
  Exam,
  ExamSchedule,
  ExamSession,
} from "../../api/types";

interface ExamScheduleFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: ExamSchedule | null;
}

export default function ExamScheduleForm({
  open,
  onClose,
  onSaved,
  initialData,
}: ExamScheduleFormProps) {
  const [examId, setExamId] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [examDate, setExamDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [exams, setExams] = useState<Exam[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [examsError, setExamsError] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState(false);

  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadExams = useCallback(() => {
    setExamsLoading(true);
    setExamsError(false);
    examService
      .list({ per_page: 100 })
      .then((res) => {
        setExams(res.data);
        setExamsError(false);
      })
      .catch(() => setExamsError(true))
      .finally(() => setExamsLoading(false));
  }, []);

  const loadRooms = useCallback(() => {
    setRoomsLoading(true);
    setRoomsError(false);
    roomService
      .list({ per_page: 100 })
      .then((res) => {
        setRooms(res.data);
        setRoomsError(false);
      })
      .catch(() => setRoomsError(true))
      .finally(() => setRoomsLoading(false));
  }, []);

  const loadSessions = useCallback(() => {
    setSessionsLoading(true);
    setSessionsError(false);
    examSessionService
      .list({ per_page: 100 })
      .then((res) => {
        setSessions(res.data);
        setSessionsError(false);
      })
      .catch(() => setSessionsError(true))
      .finally(() => setSessionsLoading(false));
  }, []);

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});
      loadExams();
      loadRooms();
      loadSessions();

      if (initialData) {
        setExamId(String(initialData.exam_id));
        setRoomId(String(initialData.room_id));
        setSessionId(String(initialData.session_id));
        setExamDate(initialData.exam_date);
      } else {
        setExamId("");
        setRoomId("");
        setSessionId("");
        setExamDate("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateExamSchedulePayload = {
      exam_id: Number(examId),
      room_id: Number(roomId),
      session_id: Number(sessionId),
      exam_date: examDate,
    };

    try {
      if (initialData) {
        await examScheduleService.update(initialData.id, payload);
        toast.success("Jadwal ujian berhasil diperbarui.");
      } else {
        await examScheduleService.create(payload);
        toast.success("Jadwal ujian berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan jadwal ujian", {
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
      title={isEdit ? "Edit Jadwal Ujian" : "Tambah Jadwal Ujian"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="exam-schedule-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="exam-schedule-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <FormField label="Ujian" required error={fieldErrors.exam_id?.[0]}>
          {examsLoading ? (
            <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Memuat ujian...
            </div>
          ) : examsError ? (
            <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
              <span>Gagal memuat data ujian.</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={loadExams}
                className="self-start"
              >
                Muat Ulang
              </Button>
            </div>
          ) : exams.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
              Tidak ada ujian tersedia.
            </p>
          ) : (
            <AppSelect
              value={examId}
              onChange={(v) => setExamId(v ?? "")}
              options={exams.map((e) => ({ value: String(e.id), label: e.title }))}
              placeholder="Pilih Ujian"
              isDisabled={submitting}
            />
          )}
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Ruangan" required error={fieldErrors.room_id?.[0]}>
            {roomsLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat ruangan...
              </div>
            ) : roomsError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data ruangan.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadRooms}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : rooms.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada ruangan tersedia.
              </p>
            ) : (
              <AppSelect
                value={roomId}
                onChange={(v) => setRoomId(v ?? "")}
                options={rooms.map((r) => ({
                  value: String(r.id),
                  label: r.name,
                }))}
                placeholder="Pilih Ruangan"
                isDisabled={submitting}
              />
            )}
          </FormField>

          <FormField label="Sesi" required error={fieldErrors.session_id?.[0]}>
            {sessionsLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat sesi...
              </div>
            ) : sessionsError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data sesi.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadSessions}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : sessions.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada sesi tersedia.
              </p>
            ) : (
              <AppSelect
                value={sessionId}
                onChange={(v) => setSessionId(v ?? "")}
                options={sessions.map((s) => ({
                  value: String(s.id),
                  label: s.name,
                }))}
                placeholder="Pilih Sesi"
                isDisabled={submitting}
              />
            )}
          </FormField>
        </div>

        <FormField label="Tanggal Ujian" required error={fieldErrors.exam_date?.[0]}>
          <Input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
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
