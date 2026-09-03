import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import { FormField, Input } from "@/components/ui/Form";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { reportService } from "../api/report.service";
import type {
  TeacherReportSummary,
  TeacherAttendanceSummaryRow,
  TeacherAttendanceSummaryParams,
} from "../api/types";

const PER_PAGE = 10;

type Section = "summary" | "attendance";

export default function TeacherReportsPage() {
  const [section, setSection] = useState<Section>("summary");

  const [summary, setSummary] = useState<TeacherReportSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<ApiError | null>(null);

  const [attendanceData, setAttendanceData] = useState<TeacherAttendanceSummaryRow[]>([]);
  const [attendanceMeta, setAttendanceMeta] = useState({
    current_page: 1,
    per_page: PER_PAGE,
    total: 0,
    last_page: 1,
  });
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState<ApiError | null>(null);

  const [dateFrom, setDateFrom] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [query, setQuery] = useState<TeacherAttendanceSummaryParams>({
    page: 1,
    per_page: PER_PAGE,
  });

  const fetchSummary = useCallback(() => {
    let active = true;

    reportService
      .teacherSummary()
      .then((res) => {
        if (!active) return;
        setSummary(res.data);
      })
      .catch((err) => {
        if (!active) return;
        setSummaryError(toApiError(err));
        toast.error("Gagal memuat ringkasan guru", {
          description: toApiError(err).message,
        });
      })
      .finally(() => {
        if (active) setSummaryLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    if (section !== "attendance") return;
    let active = true;

    reportService
      .teacherAttendanceSummary(query)
      .then((res) => {
        if (!active) return;
        setAttendanceData(res.data);
        setAttendanceMeta(res.meta);
      })
      .catch((err) => {
        if (!active) return;
        setAttendanceError(toApiError(err));
        setAttendanceData([]);
        toast.error("Gagal memuat kehadiran guru", {
          description: toApiError(err).message,
        });
      })
      .finally(() => {
        if (active) setAttendanceLoading(false);
      });

    return () => {
      active = false;
    };
  }, [section, query]);

  const handleSectionChange = useCallback((next: Section) => {
    setSection(next);
    if (next === "attendance") {
      setAttendanceLoading(true);
      setAttendanceError(null);
    }
  }, []);

  const handleApplyDates = useCallback(() => {
    setAttendanceLoading(true);
    setAttendanceError(null);
    setQuery((prev) => ({
      ...prev,
      date_from: dateFrom || undefined,
      date_end: dateEnd || undefined,
      page: 1,
    }));
  }, [dateFrom, dateEnd]);

  const goToAttendancePage = useCallback((target: number) => {
    setAttendanceLoading(true);
    setAttendanceError(null);
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const employmentColumns = [
    {
      header: "Status Kepegawaian",
      accessor: "employment_status" as keyof TeacherReportSummary["employment_breakdown"][number],
      render: (
        _value: unknown,
        row: TeacherReportSummary["employment_breakdown"][number],
      ) => (
        <span className="text-sm font-medium text-on-surface">
          {row.employment_status || "-"}
        </span>
      ),
    },
    {
      header: "Jumlah",
      accessor: "total" as keyof TeacherReportSummary["employment_breakdown"][number],
      className: "px-6 py-4 text-center text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
      render: (
        _value: unknown,
        row: TeacherReportSummary["employment_breakdown"][number],
      ) => <span className="text-sm text-slate-700">{row.total}</span>,
    },
  ];

  const attendanceColumns = [
    {
      header: "Guru",
      accessor: "teacher_name" as keyof TeacherAttendanceSummaryRow,
      render: (_value: unknown, row: TeacherAttendanceSummaryRow) => (
        <span className="text-sm font-medium text-on-surface">{row.teacher_name}</span>
      ),
    },
    {
      header: "Hadir",
      accessor: "hadir" as keyof TeacherAttendanceSummaryRow,
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
    },
    {
      header: "Sakit",
      accessor: "sakit" as keyof TeacherAttendanceSummaryRow,
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
    },
    {
      header: "Izin",
      accessor: "izin" as keyof TeacherAttendanceSummaryRow,
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
    },
    {
      header: "Alfa",
      accessor: "alfa" as keyof TeacherAttendanceSummaryRow,
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
    },
    {
      header: "Terlambat",
      accessor: "terlambat" as keyof TeacherAttendanceSummaryRow,
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
    },
    {
      header: "Total Hari",
      accessor: "total_days" as keyof TeacherAttendanceSummaryRow,
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
    },
  ];

  const isFirstAttendancePage = attendanceMeta.current_page <= 1;
  const isLastAttendancePage = attendanceMeta.current_page >= attendanceMeta.last_page;

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Laporan Guru"
        description="Ringkasan data guru dan rekap kehadiran guru."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant={section === "summary" ? "primary" : "secondary"}
          size="sm"
          onClick={() => handleSectionChange("summary")}
        >
          Ringkasan
        </Button>
        <Button
          variant={section === "attendance" ? "primary" : "secondary"}
          size="sm"
          onClick={() => handleSectionChange("attendance")}
        >
          Kehadiran Guru
        </Button>
      </div>

      {section === "summary" ? (
        summaryLoading ? (
          <Card>
            <div className="py-10 text-center text-sm text-slate-500">Memuat data...</div>
          </Card>
        ) : summaryError || !summary ? (
          <Card>
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
              <p className="text-sm text-error">
                {summaryError?.message ?? "Gagal memuat ringkasan guru."}
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setSummaryLoading(true);
                  setSummaryError(null);
                  fetchSummary();
                }}
              >
                Muat Ulang
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-surface-container-lowest p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                <p className="text-sm font-medium text-on-surface-variant">Total Guru</p>
                <p className="mt-3 font-display text-3xl font-bold tracking-tight text-on-surface">
                  {summary.total_teachers}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-surface-container-lowest p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                <p className="text-sm font-medium text-on-surface-variant">Guru Aktif</p>
                <p className="mt-3 font-display text-3xl font-bold tracking-tight text-on-surface">
                  {summary.active_teachers}
                </p>
              </div>
            </div>

            <Card className="mt-6">
              <h3 className="mb-4 font-display text-base font-semibold text-on-surface">
                Komposisi Status Kepegawaian
              </h3>
              <DataTable
                columns={employmentColumns}
                data={summary.employment_breakdown}
                emptyMessage="Belum ada data status kepegawaian."
              />
            </Card>
          </>
        )
      ) : (
        <>
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:max-w-xl">
              <FormField label="Dari Tanggal" className="flex flex-col gap-1">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </FormField>
              <FormField label="Sampai Tanggal" className="flex flex-col gap-1">
                <Input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                />
              </FormField>
            </div>
            <div className="mt-4">
              <Button variant="secondary" size="sm" onClick={handleApplyDates}>
                Terapkan Filter
              </Button>
            </div>
          </Card>

          <Card className="mt-6">
            <h3 className="mb-4 font-display text-base font-semibold text-on-surface">
              Rekap Kehadiran Guru
            </h3>

            {attendanceError ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
                <p className="text-sm text-error">
                  {attendanceError.message}
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setAttendanceLoading(true);
                    setAttendanceError(null);
                    setQuery((prev) => ({ ...prev }));
                  }}
                >
                  Muat Ulang
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3 sm:hidden">
                  {attendanceLoading ? (
                    <div className="py-10 text-center text-sm text-slate-500">
                      Memuat data...
                    </div>
                  ) : attendanceData.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-500">
                      Belum ada data kehadiran guru.
                    </div>
                  ) : (
                    attendanceData.map((row) => (
                      <div
                        key={row.teacher_id}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <p className="font-semibold text-on-surface">{row.teacher_name}</p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          Hadir {row.hadir} · Sakit {row.sakit} · Izin {row.izin} · Alfa{" "}
                          {row.alfa} · Terlambat {row.terlambat}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="hidden sm:block">
                  <DataTable
                    columns={attendanceColumns}
                    data={attendanceData}
                    loading={attendanceLoading}
                    emptyMessage="Belum ada data kehadiran guru."
                  />
                </div>
              </>
            )}

            {!attendanceError && !attendanceLoading && attendanceMeta.total > 0 && (
              <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-sm text-on-surface-variant">
                  Menampilkan{" "}
                  {attendanceMeta.total === 0
                    ? 0
                    : (attendanceMeta.current_page - 1) * attendanceMeta.per_page + 1}
                  -
                  {Math.min(
                    attendanceMeta.current_page * attendanceMeta.per_page,
                    attendanceMeta.total,
                  )}{" "}
                  dari {attendanceMeta.total} data
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isFirstAttendancePage}
                    onClick={() => goToAttendancePage(attendanceMeta.current_page - 1)}
                  >
                    Sebelumnya
                  </Button>
                  <span className="text-sm text-on-surface-variant">
                    Halaman {attendanceMeta.current_page} dari {attendanceMeta.last_page}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isLastAttendancePage}
                    onClick={() => goToAttendancePage(attendanceMeta.current_page + 1)}
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </PageContainer>
  );
}