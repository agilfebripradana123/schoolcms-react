import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, Clock, Layers, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardBody } from "@/components/ui/Card";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import { studentExamAttemptService } from "@/features/examinations/api/student-exam-attempt.service";

interface LobbyExam {
  id: number;
  title: string;
  description?: string | null;
  subject_id: number;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  max_attempts: number;
  status: string;
  shuffle_questions: boolean;
  shuffle_options: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draf",
  published: "Terbit",
  ongoing: "Berlangsung",
  completed: "Selesai",
  archived: "Arsip",
};

export default function StudentExamLobbyPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<LobbyExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: LobbyExam[] }>(STUDENTS.EXAMS);
      const found = (res.data ?? []).find((e) => e.id === Number(examId));
      if (!found) {
        setError("Ujian tidak ditemukan atau Anda bukan pesertanya.");
      } else {
        setExam(found);
      }
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStart = async () => {
    if (!examId) return;
    setStarting(true);
    try {
      const res = await studentExamAttemptService.start(Number(examId));
      const attempt = res.data;
      if (attempt?.id) {
        navigate(`/siswa/exams/attempt/${attempt.id}`);
      }
    } catch (err) {
      const apiErr = toApiError(err);
      toast.error("Tidak dapat memulai ujian", { description: apiErr.message });
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Ujian" description="Mulai ujian" />
        <PortalLoadingState message="Memuat..." />
      </PageContainer>
    );
  }

  if (error || !exam) {
    return (
      <PageContainer>
        <PageHeader title="Ujian" description="Mulai ujian" />
        <Card>
          <CardBody>
            <p className="text-sm text-red-600">{error ?? "Ujian tidak ditemukan."}</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate("/siswa/exams")}>
              Kembali
            </Button>
          </CardBody>
        </Card>
      </PageContainer>
    );
  }

  const canStart = ["published", "ongoing"].includes(exam.status);

  return (
    <PageContainer>
      <PageHeader title="Ujian" description={exam.title} />
      <Card>
        <CardBody>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{exam.title}</h2>
              <p className="mt-1 text-sm text-slate-500 line-clamp-3">{exam.description ?? "-"}</p>
            </div>
            <Badge variant={canStart ? "primary" : "neutral"}>
              {STATUS_LABELS[exam.status] ?? exam.status}
            </Badge>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <Clock className="h-5 w-5 text-indigo-500" />
              <p className="mt-2 text-xs text-slate-500">Durasi</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">{exam.duration_minutes} menit</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <Layers className="h-5 w-5 text-indigo-500" />
              <p className="mt-2 text-xs text-slate-500">Jumlah Soal</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">{exam.total_questions}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <RotateCcw className="h-5 w-5 text-indigo-500" />
              <p className="mt-2 text-xs text-slate-500">Maks. Percobaan</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">{exam.max_attempts}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              <p className="mt-2 text-xs text-slate-500">KKM</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">{exam.passing_score}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-700">Petunjuk</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Ujian dikerjakan dalam mode layar penuh.</li>
              <li>Jangan berpindah tab atau keluar dari layar penuh selama ujian.</li>
              <li>Jawaban akan disimpan otomatis.</li>
              <li>Waktu mengikuti server dan tidak dapat diperpanjang.</li>
            </ul>
          </div>

          <Button className="mt-6 w-full" onClick={handleStart} loading={starting} disabled={!canStart}>
            {canStart ? "Mulai Ujian" : "Ujian tidak dapat dimulai"}
          </Button>
        </CardBody>
      </Card>
    </PageContainer>
  );
}
