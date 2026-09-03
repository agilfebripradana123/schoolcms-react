import { useCallback, useEffect, useState } from "react";
import { Loader2, BookOpen, Calendar, FileText, Users, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";
import { formatDate } from "@/lib/format";

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
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-600">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ujian</h1>
          <p className="mt-1 text-sm text-slate-500">Jadwal dan hasil ujian</p>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">Belum ada ujian.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ujian</h1>
        <p className="mt-1 text-sm text-slate-500">Jadwal dan hasil ujian</p>
      </div>

      {/* Exams */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-indigo-500" />
          <h2 className="text-sm font-semibold text-slate-700">Daftar Ujian</h2>
        </div>
        <div className="space-y-3">
          {exams.map((e) => (
            <div key={e.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-900">{e.title}</h3>
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">{e.description ?? "-"}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                {e.subject?.name && <span>{e.subject.name}</span>}
                {e.exam_date && <span>{formatDate(e.exam_date)}</span>}
                {e.status && <span className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">{e.status}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedules */}
      {schedules.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-700">Jadwal Ujian</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">Ujian</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">Tanggal</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{s.exam?.title ?? `Ujian #${s.exam_id}`}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(s.exam_date)}</td>
                    <td className="px-4 py-3 text-slate-600">{s.start_time ?? "-"} - {s.end_time ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instructions */}
      {instructions.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-700">Instruksi Ujian</h2>
          </div>
          <div className="space-y-2">
            {instructions.map((i) => (
              <div key={i.id} className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                <p className="text-sm text-slate-700">{i.instruction}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participants */}
      {participants.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-700">Peserta Ujian (Anda)</h2>
          </div>
          <div className="space-y-2">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span className="text-sm text-slate-700">{p.exam?.title ?? `Ujian #${p.exam_id}`}</span>
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {p.status ?? "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
                {r.status && (
                  <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {r.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}