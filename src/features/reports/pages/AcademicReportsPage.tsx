import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import { FormField } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { reportService } from "../api/report.service";
import type { AcademicGradesSummaryRow } from "../api/types";
import { classService } from "@/features/academic/api/class.service";
import { subjectService } from "@/features/academic/api/subject.service";
import { academicYearService } from "@/features/academic/api/academic-year.service";
import type { AcademicYear, SchoolClass, Subject } from "@/features/academic/api/types";

const PER_PAGE = 10;

const SEMESTER_OPTIONS = [
  { value: "all", label: "Semua Semester" },
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
];

interface QueryState {
  class_id: number | undefined;
  subject_id: number | undefined;
  semester: "1" | "2" | undefined;
  academic_year: string | undefined;
  page: number;
}

export default function AcademicReportsPage() {
  const [rows, setRows] = useState<AcademicGradesSummaryRow[]>([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: PER_PAGE,
    total: 0,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  const [classFilter, setClassFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [academicYearId, setAcademicYearId] = useState("all");

  const [query, setQuery] = useState<QueryState>({
    class_id: undefined,
    subject_id: undefined,
    semester: undefined,
    academic_year: undefined,
    page: 1,
  });

  const fetchFilters = useCallback(() => {
    let active = true;

    Promise.all([
      classService.list({ per_page: 100 }),
      subjectService.list({ per_page: 100 }),
      academicYearService.list({ per_page: 100 }),
    ])
      .then(([classesRes, subjectsRes, yearsRes]) => {
        if (!active) return;
        setClasses(classesRes.data);
        setSubjects(subjectsRes.data);
        setAcademicYears(yearsRes.data);
      })
      .catch(() => {
        // Filter relasi opsional; list tetap dapat ditampilkan tanpa nama.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    let active = true;

    reportService
      .academicGradesSummary({
        class_id: query.class_id,
        subject_id: query.subject_id,
        semester: query.semester,
        academic_year: query.academic_year,
        page: query.page,
        per_page: PER_PAGE,
      })
      .then((res) => {
        if (!active) return;
        setRows(res.data);
        setMeta(res.meta);
      })
      .catch((err) => {
        if (!active) return;
        setError(toApiError(err));
        setRows([]);
        toast.error("Gagal memuat laporan akademik", {
          description: toApiError(err).message,
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  const goToPage = useCallback((target: number) => {
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const handleClassChange = useCallback((value: string) => {
    setClassFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      class_id: value === "all" ? undefined : Number(value),
      page: 1,
    }));
  }, []);

  const handleSubjectChange = useCallback((value: string) => {
    setSubjectFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      subject_id: value === "all" ? undefined : Number(value),
      page: 1,
    }));
  }, []);

  const handleSemesterChange = useCallback((value: string) => {
    setSemesterFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      semester: value === "all" ? undefined : (value as "1" | "2"),
      page: 1,
    }));
  }, []);

  const handleAcademicYearChange = useCallback((value: string) => {
    setAcademicYearId(value);
    const selected = academicYears.find((y) => String(y.id) === value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      academic_year: selected?.name ?? undefined,
      page: 1,
    }));
  }, [academicYears]);

  const classOptions = useMemo(
    () => [
      { value: "all", label: "Semua Kelas" },
      ...classes.map((c) => ({ value: String(c.id), label: c.name })),
    ],
    [classes],
  );

  const subjectOptions = useMemo(
    () => [
      { value: "all", label: "Semua Mata Pelajaran" },
      ...subjects.map((s) => ({ value: String(s.id), label: s.name })),
    ],
    [subjects],
  );

  const academicYearOptions = useMemo(
    () => [
      { value: "all", label: "Semua Tahun Ajaran" },
      ...academicYears.map((y) => ({ value: String(y.id), label: y.name })),
    ],
    [academicYears],
  );

  const columns = [
    {
      header: "Nama Siswa",
      accessor: "student_name" as keyof AcademicGradesSummaryRow,
      render: (_value: unknown, row: AcademicGradesSummaryRow) => (
        <span className="text-sm font-medium text-on-surface">{row.student_name}</span>
      ),
    },
    {
      header: "Rata-rata Nilai",
      accessor: "average_score" as keyof AcademicGradesSummaryRow,
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
      render: (_value: unknown, row: AcademicGradesSummaryRow) => (
        <span className="text-sm text-slate-700">
          {Number(row.average_score).toFixed(1)}
        </span>
      ),
    },
    {
      header: "Jumlah Nilai",
      accessor: "total_grades" as keyof AcademicGradesSummaryRow,
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
      render: (_value: unknown, row: AcademicGradesSummaryRow) => (
        <span className="text-sm text-slate-700">{Number(row.total_grades)}</span>
      ),
    },
  ];

  const isFirstPage = meta.current_page <= 1;
  const isLastPage = meta.current_page >= meta.last_page;
  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  const emptyMessage =
    query.class_id ||
    query.subject_id ||
    query.semester ||
    query.academic_year
      ? "Tidak ada data nilai yang sesuai dengan filter."
      : "Belum ada data nilai.";

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Laporan Akademik"
        description="Ringkasan rata-rata nilai siswa berdasarkan kelas, mata pelajaran, semester, dan tahun ajaran."
      />

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 *:md:gap-3">
          <FormField label="Kelas" className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
            <AppSelect
              options={classOptions}
              value={classFilter}
              onChange={(v) => handleClassChange(v ?? "all")}
              placeholder="Pilih Kelas"
            />
          </FormField>
          <FormField label="Mata Pelajaran" className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
            <AppSelect
              options={subjectOptions}
              value={subjectFilter}
              onChange={(v) => handleSubjectChange(v ?? "all")}
              placeholder="Pilih Mata Pelajaran"
            />
          </FormField>
          <FormField label="Semester" className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
            <AppSelect
              options={SEMESTER_OPTIONS}
              value={semesterFilter}
              onChange={(v) => handleSemesterChange(v ?? "all")}
              placeholder="Pilih Semester"
            />
          </FormField>
          <FormField label="Tahun Ajaran" className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
            <AppSelect
              options={academicYearOptions}
              value={academicYearId}
              onChange={(v) => handleAcademicYearChange(v ?? "all")}
              placeholder="Pilih Tahun Ajaran"
            />
          </FormField>
        </div>

        {error ? (
          <div className="mt-4 flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat laporan akademik.</p>
            <Button
              variant="secondary"
              onClick={() => {
                setLoading(true);
                setError(null);
                setQuery((prev) => ({ ...prev }));
              }}
            >
              Muat Ulang
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-3 sm:hidden">
              {loading ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Memuat data...
                </div>
              ) : rows.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  {emptyMessage}
                </div>
              ) : (
                rows.map((row) => (
                  <div
                    key={row.student_id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <p className="font-semibold text-on-surface">{row.student_name}</p>
                    <p className="mt-0.5 text-xs text-on-surface-variant">
                      Rata-rata: {Number(row.average_score).toFixed(1)} ·{" "}
                      {Number(row.total_grades)} nilai
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 hidden sm:block">
              <DataTable
                columns={columns}
                data={rows}
                loading={loading}
                emptyMessage={emptyMessage}
              />
            </div>
          </>
        )}

        {!error && !loading && meta.total > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-on-surface-variant">
              Menampilkan {from}-{to} dari {meta.total} data
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={isFirstPage}
                onClick={() => goToPage(meta.current_page - 1)}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-on-surface-variant">
                Halaman {meta.current_page} dari {meta.last_page}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={isLastPage}
                onClick={() => goToPage(meta.current_page + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}