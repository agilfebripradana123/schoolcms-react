import { useCallback, useEffect, useState } from "react";
import { Calendar, BookOpen } from "lucide-react";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import PortalFilterBar from "@/portal/components/PortalFilterBar";
import Pagination from "../../../components/ui/Pagination";
import { myExamScheduleService } from "@/features/examinations";
import type { ExamSchedule } from "@/features/examinations/api/types";
import { toApiError } from "@/lib/api";
import type { SelectOption } from "@/components/ui/Select";

export default function TeacherExamSchedulesPage() {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [meta, setMeta] = useState<{ total: number; last_page: number; current_page: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [examId, setExamId] = useState<number | null>(null);
  const [examDate, setExamDate] = useState("");
  const [page, setPage] = useState(1);

  const [examOptions, setExamOptions] = useState<SelectOption<number>[]>([]);

  const load = useCallback((pageNum: number, exam: number | null, date: string) => {
    setLoading(true);
    setError(null);
    myExamScheduleService
      .list({
        page: pageNum,
        per_page: 15,
        exam_id: exam ?? undefined,
        exam_date: date || undefined,
      })
      .then((res) => {
        setSchedules(res.data ?? []);
        setMeta(res.meta ?? null);
        setExamOptions((prev) => {
          const seen = new Map<number, string>(prev.map((o) => [o.value, o.label]));
          for (const s of res.data ?? []) {
            if (s.exam_id != null) {
              seen.set(s.exam_id, s.exam?.title ?? `Ujian ${s.exam_id}`);
            }
          }
          return Array.from(seen, ([value, label]) => ({ value, label }));
        });
      })
      .catch((err) => setError(toApiError(err).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(page, examId, examDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    setPage(1);
    load(1, examId, examDate);
  };

  const [detail, setDetail] = useState<ExamSchedule | null>(null);

  const formatTime = (t?: string | null) => t ?? "—";

  return (
    <PageContainer>
      <PageHeader
        title="Jadwal Ujian"
        description="Jadwal ujian pada mata pelajaran yang menjadi scope mengajar Anda."
      />

      <PortalFilterBar className="mb-6">
          <Calendar className="h-4 w-4 text-slate-500" />
          <label className="text-sm font-medium text-slate-700">Tanggal:</label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-300 focus:outline-none"
          />
          <label className="text-sm font-medium text-slate-700">Ujian:</label>
          <div className="min-w-[200px]">
            <Select<number> options={examOptions} value={examId} onChange={setExamId} placeholder="Semua ujian" isClearable />
          </div>
          <Button onClick={applyFilters} disabled={loading}>
            Tampilkan
          </Button>
      </PortalFilterBar>

      {error ? (
        <PortalErrorState message={error} />
      ) : schedules.length === 0 && !loading ? (
        <PortalEmptyState icon={<BookOpen className="h-10 w-10" />} description="Belum ada jadwal ujian pada scope mengajar Anda." />
      ) : (
        <DataTable<ExamSchedule>
          loading={loading}
          emptyMessage="Belum ada jadwal ujian pada scope mengajar Anda."
          columns={[
            { header: "No", accessor: "id", render: (_v, row) => schedules.findIndex((s) => s.id === row.id) + 1 },
            {
              header: "Ujian",
              accessor: "id",
              render: (_v, row) => (
                <button
                  type="button"
                  onClick={() => setDetail(row)}
                  className="text-left font-semibold text-indigo-600 hover:underline"
                >
                  {row.exam?.title ?? "-"}
                </button>
              ),
            },
            { header: "Mata Pelajaran", accessor: "id", render: (_v, row) => row.exam?.subject?.name ?? "-" },
            { header: "Tanggal", accessor: "exam_date", render: (v) => (v ? String(v) : "-") },
            { header: "Ruang", accessor: "id", render: (_v, row) => row.room?.name ?? "-" },
            { header: "Sesi", accessor: "id", render: (_v, row) => row.session?.name ?? "-" },
            {
              header: "Waktu",
              accessor: "id",
              render: (_v, row) => (
                <span>
                  {formatTime(row.session?.start_time)} – {formatTime(row.session?.end_time)}
                </span>
              ),
            },
          ]}
          data={schedules}
        />
      )}
      {meta && !error && (
        <div className="mt-4">
          <Pagination
            meta={{ current_page: meta.current_page, last_page: meta.last_page, per_page: 15, total: meta.total }}
            onPageChange={(n) => { setPage(n); load(n, examId, examDate); }}
            loading={loading}
            error={error}
          />
        </div>
      )}

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Detail Jadwal Ujian"
        footer={
          <Button variant="ghost" onClick={() => setDetail(null)}>
            Tutup
          </Button>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{detail.exam?.title ?? "-"}</h3>
              <p className="mt-1 text-sm text-slate-500">{detail.exam?.subject?.name ?? "-"}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Tanggal</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{detail.exam_date ?? "-"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Ruang</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{detail.room?.name ?? "-"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Sesi</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{detail.session?.name ?? "-"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="neutral">
                {formatTime(detail.session?.start_time)} – {formatTime(detail.session?.end_time)}
              </Badge>
              {detail.exam && (
                <Badge variant="primary">{detail.exam.duration_minutes} menit</Badge>
              )}
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
