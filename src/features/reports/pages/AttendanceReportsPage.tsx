import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import { FormField, Input } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { ApiError } from "@/types";
import { reportService } from "../api/report.service";
import type {
  AttendanceDailyReport,
  AttendanceStudentSummaryRow,
} from "../api/types";
import { classService } from "@/features/academic/api/class.service";
import type { SchoolClass } from "@/features/academic/api/types";

const PER_PAGE = 10;

type Section = "daily" | "student";

function todayISODate(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export default function AttendanceReportsPage() {
  const [section, setSection] = useState<Section>("daily");

  const [classes, setClasses] = useState<SchoolClass[]>([]);

  const [daily, setDaily] = useState<AttendanceDailyReport | null>(null);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [dailyError, setDailyError] = useState<ApiError | null>(null);
  const [dailyDate, setDailyDate] = useState(todayISODate);
  const [dailyClassFilter, setDailyClassFilter] = useState("all");
  const [dailyQuery, setDailyQuery] = useState<{
    date: string;
    class_id: number | undefined;
  }>({ date: todayISODate(), class_id: undefined });

  const [studentRows, setStudentRows] = useState<AttendanceStudentSummaryRow[]>([]);
  const [studentMeta, setStudentMeta] = useState({
    current_page: 1,
    per_page: PER_PAGE,
    total: 0,
    last_page: 1,
  });
  const [studentLoading, setStudentLoading] = useState(true);
  const [studentError, setStudentError] = useState<ApiError | null>(null);
  const [studentDateFrom, setStudentDateFrom] = useState("");
  const [studentDateEnd, setStudentDateEnd] = useState("");
  const [studentClassFilter, setStudentClassFilter] = useState("all");
  const [studentQuery, setStudentQuery] = useState<{
    date_from: string | undefined;
    date_end: string | undefined;
    class_id: number | undefined;
    page: number;
  }>({ date_from: undefined, date_end: undefined, class_id: undefined, page: 1 });

  const fetchClasses = useCallback(() => {
    let active = true;

    classService
      .list({ per_page: 100 })
      .then((res) => {
        if (!active) return;
        setClasses(res.data);
      })
      .catch(() => {
        // Filter kelas opsional; laporan tetap dapat ditampilkan tanpa nama.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (section !== "daily") return;
    let active = true;

    reportService
      .attendanceDaily(dailyQuery)
      .then((res) => {
        if (!active) return;
        setDaily(res.data);
      })
      .catch((err) => {
        if (!active) return;
        setDailyError(toApiError(err));
        setDaily(null);
        toast.error("Gagal memuat kehadiran harian", {
          description: toApiError(err).message,
        });
      })
      .finally(() => {
        if (active) setDailyLoading(false);
      });

    return () => {
      active = false;
    };
  }, [section, dailyQuery]);

  useEffect(() => {
    if (section !== "student") return;
    let active = true;

    reportService
      .attendanceStudentSummary({
        date_from: studentQuery.date_from,
        date_end: studentQuery.date_end,
        class_id: studentQuery.class_id,
        page: studentQuery.page,
        per_page: PER_PAGE,
      })
      .then((res) => {
        if (!active) return;
        setStudentRows(res.data);
        setStudentMeta(res.meta);
      })
      .catch((err) => {
        if (!active) return;
        setStudentError(toApiError(err));
        setStudentRows([]);
        toast.error("Gagal memuat ringkasan kehadiran siswa", {
          description: toApiError(err).message,
        });
      })
      .finally(() => {
        if (active) setStudentLoading(false);
      });

    return () => {
      active = false;
    };
  }, [section, studentQuery]);

  const handleSectionChange = useCallback((next: Section) => {
    setSection(next);
    if (next === "daily") {
      setDailyLoading(true);
      setDailyError(null);
    } else {
      setStudentLoading(true);
      setStudentError(null);
    }
  }, []);

  const handleApplyDaily = useCallback(() => {
    setDailyLoading(true);
    setDailyError(null);
    setDailyQuery({
      date: dailyDate,
      class_id: dailyClassFilter === "all" ? undefined : Number(dailyClassFilter),
    });
  }, [dailyDate, dailyClassFilter]);

  const handleApplyStudent = useCallback(() => {
    setStudentLoading(true);
    setStudentError(null);
    setStudentQuery({
      date_from: studentDateFrom || undefined,
      date_end: studentDateEnd || undefined,
      class_id: studentClassFilter === "all" ? undefined : Number(studentClassFilter),
      page: 1,
    });
  }, [studentDateFrom, studentDateEnd, studentClassFilter]);

  const goStudentPage = useCallback((target: number) => {
    setStudentLoading(true);
    setStudentError(null);
    setStudentQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const classOptions = useMemo(
    () => [
      { value: "all", label: "Semua Kelas" },
      ...classes.map((c) => ({ value: String(c.id), label: c.name })),
    ],
    [classes],
  );

  const dailyClassColumns = [
    {
      header: "Kelas",
      accessor: "class_name" as keyof AttendanceDailyReport["per_class"][number],
      render: (
        _value: unknown,
        row: AttendanceDailyReport["per_class"][number],
      ) => (
        <span className="text-sm font-medium text-on-surface">
          {row.class_name ?? "-"}
        </span>
      ),
    },
    {
      header: "Hadir",
      accessor: "hadir" as keyof AttendanceDailyReport["per_class"][number],
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
    },
    {
      header: "Sakit",
      accessor: "sakit" as keyof AttendanceDailyReport["per_class"][number],
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
    },
    {
      header: "Izin",
      accessor: "izin" as keyof AttendanceDailyReport["per_class"][number],
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
    },
    {
      header: "Alfa",
      accessor: "alfa" as keyof AttendanceDailyReport["per_class"][number],
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
    },
  ];

  const studentColumns = [
    {
      header: "Nama Siswa",
      accessor: "student_name" as keyof AttendanceStudentSummaryRow,
      render: (_value: unknown, row: AttendanceStudentSummaryRow) => (
        <span className="text-sm font-medium text-on-surface">{row.student_name}</span>
      ),
    },
    {
      header: "Hari",
      accessor: "total_days" as keyof AttendanceStudentSummaryRow,
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
    },
    {
      header: "Hadir",
      accessor: "hadir" as keyof AttendanceStudentSummaryRow,
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
    },
    {
      header: "Sakit",
      accessor: "sakit" as keyof AttendanceStudentSummaryRow,
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
    },
    {
      header: "Izin",
      accessor: "izin" as keyof AttendanceStudentSummaryRow,
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
    },
    {
      header: "Alfa",
      accessor: "alfa" as keyof AttendanceStudentSummaryRow,
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
    },
    {
      header: "Kehadiran",
      accessor: "attendance_percentage" as keyof AttendanceStudentSummaryRow,
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
      render: (_value: unknown, row: AttendanceStudentSummaryRow) => (
        <span className="whitespace-nowrap text-sm text-slate-700">
          {row.attendance_percentage}%
        </span>
      ),
    },
  ];

  const isFirstStudentPage = studentMeta.current_page <= 1;
  const isLastStudentPage = studentMeta.current_page >= studentMeta.last_page;

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Laporan Kehadiran"
        description="Rekap kehadiran harian per kelas dan ringkasan kehadiran siswa."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant={section === "daily" ? "primary" : "secondary"}
          size="sm"
          onClick={() => handleSectionChange("daily")}
        >
          Kehadiran Harian
        </Button>
        <Button
          variant={section === "student" ? "primary" : "secondary"}
          size="sm"
          onClick={() => handleSectionChange("student")}
        >
          Ringkasan Siswa
        </Button>
      </div>

      {section === "daily" ? (
        <>
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:max-w-xl">
              <FormField label="Tanggal" className="flex flex-col gap-1">
                <Input
                  type="date"
                  value={dailyDate}
                  onChange={(e) => setDailyDate(e.target.value)}
                />
              </FormField>
              <FormField label="Kelas" className="flex flex-col gap-1">
                <AppSelect
                  options={classOptions}
                  value={dailyClassFilter}
                  onChange={(v) => setDailyClassFilter(v ?? "all")}
                  placeholder="Pilih Kelas"
                />
              </FormField>
            </div>
            <div className="mt-4">
              <Button variant="secondary" size="sm" onClick={handleApplyDaily}>
                Tampilkan
              </Button>
            </div>
          </Card>

          <Card className="mt-6">
            <h3 className="mb-4 font-display text-base font-semibold text-on-surface">
              Rekap Kehadiran{" "}
              {daily?.date ? formatDate(daily.date) : ""}
            </h3>
            {dailyError ? (
              <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-xl py-10">
                <p className="text-sm text-error">{dailyError.message}</p>
                <Button variant="secondary" onClick={handleApplyDaily}>
                  Muat Ulang
                </Button>
              </div>
            ) : dailyLoading || !daily ? (
              <div className="py-10 text-center text-sm text-slate-500">Memuat data...</div>
            ) : (
              <>
                <div className="flex flex-wrap gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-surface-container-low p-4">
                    <p className="text-xs font-medium text-on-surface-variant">Hadir</p>
                    <p className="mt-1 font-display text-2xl font-bold text-on-surface">
                      {daily.totals.hadir}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-surface-container-low p-4">
                    <p className="text-xs font-medium text-on-surface-variant">Sakit</p>
                    <p className="mt-1 font-display text-2xl font-bold text-on-surface">
                      {daily.totals.sakit}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-surface-container-low p-4">
                    <p className="text-xs font-medium text-on-surface-variant">Izin</p>
                    <p className="mt-1 font-display text-2xl font-bold text-on-surface">
                      {daily.totals.izin}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-surface-container-low p-4">
                    <p className="text-xs font-medium text-on-surface-variant">Alfa</p>
                    <p className="mt-1 font-display text-2xl font-bold text-on-surface">
                      {daily.totals.alfa}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="mb-3 text-sm font-semibold text-on-surface">
                    Per Kelas
                  </h4>
                  <DataTable
                    columns={dailyClassColumns}
                    data={daily.per_class}
                    emptyMessage="Belum ada data kelas pada tanggal ini."
                  />
                </div>
              </>
            )}
          </Card>
        </>
      ) : (
        <>
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:max-w-3xl">
              <FormField label="Dari Tanggal" className="flex flex-col gap-1">
                <Input
                  type="date"
                  value={studentDateFrom}
                  onChange={(e) => setStudentDateFrom(e.target.value)}
                />
              </FormField>
              <FormField label="Sampai Tanggal" className="flex flex-col gap-1">
                <Input
                  type="date"
                  value={studentDateEnd}
                  onChange={(e) => setStudentDateEnd(e.target.value)}
                />
              </FormField>
              <FormField label="Kelas" className="flex flex-col gap-1">
                <AppSelect
                  options={classOptions}
                  value={studentClassFilter}
                  onChange={(v) => setStudentClassFilter(v ?? "all")}
                  placeholder="Pilih Kelas"
                />
              </FormField>
            </div>
            <div className="mt-4">
              <Button variant="secondary" size="sm" onClick={handleApplyStudent}>
                Terapkan Filter
              </Button>
            </div>
          </Card>

          <Card className="mt-6">
            <h3 className="mb-4 font-display text-base font-semibold text-on-surface">
              Ringkasan Kehadiran Siswa
            </h3>
            {studentError ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
                <p className="text-sm text-error">{studentError.message}</p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStudentLoading(true);
                    setStudentError(null);
                    setStudentQuery((prev) => ({ ...prev }));
                  }}
                >
                  Muat Ulang
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3 sm:hidden">
                  {studentLoading ? (
                    <div className="py-10 text-center text-sm text-slate-500">
                      Memuat data...
                    </div>
                  ) : studentRows.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-500">
                      Belum ada data kehadiran siswa.
                    </div>
                  ) : (
                    studentRows.map((row) => (
                      <div
                        key={row.student_id}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <p className="font-semibold text-on-surface">{row.student_name}</p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          Hadir {row.hadir} · Sakit {row.sakit} · Izin {row.izin} · Alfa{" "}
                          {row.alfa}
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          Kehadiran: {row.attendance_percentage}%
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="hidden sm:block">
                  <DataTable
                    columns={studentColumns}
                    data={studentRows}
                    loading={studentLoading}
                    emptyMessage="Belum ada data kehadiran siswa."
                  />
                </div>
              </>
            )}

            {!studentError && !studentLoading && studentMeta.total > 0 && (
              <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-sm text-on-surface-variant">
                  Menampilkan{" "}
                  {studentMeta.total === 0
                    ? 0
                    : (studentMeta.current_page - 1) * studentMeta.per_page + 1}
                  -
                  {Math.min(
                    studentMeta.current_page * studentMeta.per_page,
                    studentMeta.total,
                  )}{" "}
                  dari {studentMeta.total} data
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isFirstStudentPage}
                    onClick={() => goStudentPage(studentMeta.current_page - 1)}
                  >
                    Sebelumnya
                  </Button>
                  <span className="text-sm text-on-surface-variant">
                    Halaman {studentMeta.current_page} dari {studentMeta.last_page}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isLastStudentPage}
                    onClick={() => goStudentPage(studentMeta.current_page + 1)}
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