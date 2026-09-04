import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
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
    <PageContainer className="py-6">
      <PageHeader
        title="Jadwal Ujian"
        description="Jadwal ujian pada mata pelajaran yang menjadi scope mengajar Anda."
      />

      <Card>
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Tanggal
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-on-surface focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Ujian
            </label>
            <Select<number> options={examOptions} value={examId} onChange={setExamId} placeholder="Semua ujian" isClearable />
          </div>
          <div className="flex items-end">
            <Button onClick={applyFilters} disabled={loading} className="w-full">
              Tampilkan
            </Button>
          </div>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">{error}</p>
            <Button variant="secondary" size="sm" onClick={applyFilters}>
              Muat Ulang
            </Button>
          </div>
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
                      className="text-left font-semibold text-primary hover:underline"
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
        {meta && (
          <Pagination
            meta={{ current_page: meta.current_page, last_page: meta.last_page, per_page: 15, total: meta.total }}
            onPageChange={(n) => { setPage(n); load(n, examId, examDate); }}
            loading={loading}
            error={error}
          />
        )}
      </Card>

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
              <h3 className="text-lg font-bold text-on-surface">{detail.exam?.title ?? "-"}</h3>
              <p className="mt-1 text-sm text-on-surface-variant">{detail.exam?.subject?.name ?? "-"}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-surface-container-high p-3">
                <p className="text-xs text-on-surface-variant">Tanggal</p>
                <p className="mt-1 text-sm font-semibold text-on-surface">{detail.exam_date ?? "-"}</p>
              </div>
              <div className="rounded-xl bg-surface-container-high p-3">
                <p className="text-xs text-on-surface-variant">Ruang</p>
                <p className="mt-1 text-sm font-semibold text-on-surface">{detail.room?.name ?? "-"}</p>
              </div>
              <div className="rounded-xl bg-surface-container-high p-3">
                <p className="text-xs text-on-surface-variant">Sesi</p>
                <p className="mt-1 text-sm font-semibold text-on-surface">{detail.session?.name ?? "-"}</p>
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
