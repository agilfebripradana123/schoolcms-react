import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Calendar, FileText, Users, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";
import { formatDate } from "@/lib/format";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardBody } from "@/components/ui/Card";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";

interface ExamRow {
  id: number;
  title: string;
  description?: string | null;
  subject?: { name: string } | null;
  class_id: number;
  exam_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status?: string | null;
}

interface ExamScheduleRow {
  id: number;
  exam_id: number;
  exam_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  exam?: ExamRow | null;
}

interface ExamParticipantRow {
  id: number;
  exam_id: number;
  status?: string | null;
  exam?: ExamRow | null;
}

interface ExamResultRow {
  id: number;
  participant_id: number;
  score?: number | null;
  grade?: string | null;
  status?: string | null;
}

interface ExamInstructionRow {
  id: number;
  exam_id: number;
  instruction: string;
}

export default function StudentExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [schedules, setSchedules] = useState<ExamScheduleRow[]>([]);
  const [participants, setParticipants] = useState<ExamParticipantRow[]>([]);
  const [results, setResults] = useState<ExamResultRow[]>([]);
  const [instructions, setInstructions] = useState<ExamInstructionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [examsRes, schedulesRes, participantsRes, resultsRes, instructionsRes] = await Promise.all([
        api.get<{ success: boolean; data: ExamRow[] }>(STUDENTS.EXAMS),
        api.get<{ success: boolean; data: ExamScheduleRow[] }>(STUDENTS.EXAM_SCHEDULES),
        api.get<{ success: boolean; data: ExamParticipantRow[] }>(STUDENTS.EXAM_PARTICIPANTS),
        api.get<{ success: boolean; data: ExamResultRow[] }>(STUDENTS.EXAM_RESULTS),
        api.get<{ success: boolean; data: ExamInstructionRow[] }>(STUDENTS.EXAM_INSTRUCTIONS),
      ]);
      setExams(examsRes.data ?? []);
      setSchedules(schedulesRes.data ?? []);
      setParticipants(participantsRes.data ?? []);
      setResults(resultsRes.data ?? []);
      setInstructions(instructionsRes.data ?? []);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      toast.error("Gagal memuat data ujian", { description: apiErr.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Ujian" description="Jadwal dan hasil ujian" />
        <PortalLoadingState message="Memuat..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Ujian" description="Jadwal dan hasil ujian" />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (exams.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Ujian" description="Jadwal dan hasil ujian" />
        <PortalEmptyState icon={<BookOpen />} description="Belum ada ujian." />
      </PageContainer>
    );
  }

  const scheduleData = schedules.map((s) => ({
    id: s.id,
    exam: s.exam?.title ?? `Ujian #${s.exam_id}`,
    date: formatDate(s.exam_date),
    time: `${s.start_time ?? "-"} - ${s.end_time ?? "-"}`,
  }));

  const scheduleColumns = [
    { header: "Ujian", accessor: "exam" as const, render: (v: unknown) => <span className="font-medium text-slate-700">{String(v)}</span> },
    { header: "Tanggal", accessor: "date" as const },
    { header: "Waktu", accessor: "time" as const },
  ];

  return (
    <PageContainer>
      <PageHeader title="Ujian" description="Jadwal dan hasil ujian" />

      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-700">Daftar Ujian</h2>
          </div>
          <div className="space-y-3">
            {exams.map((e) => (
              <Card key={e.id} className="bg-slate-50">
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">{e.title}</h3>
                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">{e.description ?? "-"}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                        {e.subject?.name && <Badge variant="secondary">{e.subject.name}</Badge>}
                        {e.exam_date && <span>{formatDate(e.exam_date)}</span>}
                        {e.status && <Badge variant="primary">{e.status}</Badge>}
                      </div>
                    </div>
                    {e.status === "published" || e.status === "ongoing" ? (
                      <Button size="sm" onClick={() => navigate(`/siswa/exams/${e.id}`)}>
                        Kerjakan
                      </Button>
                    ) : null}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </CardBody>
      </Card>

      {schedules.length > 0 && (
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-700">Jadwal Ujian</h2>
            </div>
            <DataTable columns={scheduleColumns} data={scheduleData} />
          </CardBody>
        </Card>
      )}

      {instructions.length > 0 && (
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-700">Instruksi Ujian</h2>
            </div>
            <div className="space-y-2">
              {instructions.map((i) => (
                <Card key={i.id} className="bg-amber-50/50 border-amber-100">
                  <CardBody><p className="text-sm text-slate-700">{i.instruction}</p></CardBody>
                </Card>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {participants.length > 0 && (
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-700">Peserta Ujian (Anda)</h2>
            </div>
            <div className="space-y-2">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <span className="text-sm text-slate-700">{p.exam?.title ?? `Ujian #${p.exam_id}`}</span>
                  <Badge variant="neutral">{p.status ?? "-"}</Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-700">Hasil</h2>
            </div>
            <div className="space-y-2">
              {results.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold">Nilai: {r.score ?? "-"}</span>
                    {r.grade && <span className="ml-2 text-slate-500">({r.grade})</span>}
                  </div>
                  {r.status && <Badge variant="success">{r.status}</Badge>}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </PageContainer>
  );
}