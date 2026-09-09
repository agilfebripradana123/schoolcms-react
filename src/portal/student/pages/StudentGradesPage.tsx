import { useCallback, useEffect, useMemo, useState } from "react";
import { TrendingUp, BookOpen, Award } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PortalStatCard from "@/portal/components/PortalStatCard";
import PortalFilterBar from "@/portal/components/PortalFilterBar";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import DataTable from "@/components/ui/DataTable";
import AppSelect from "../../../components/ui/Select";

interface GradeRow {
  subject_name: string;
  tugas: number | null;
  uts: number | null;
  uas: number | null;
  final_score: number | null;
}

interface Summary {
  average: number;
  highest: number;
  total_subjects: number;
}

interface SemesterOption {
  id: number;
  name: string;
}

interface AcademicYearOption {
  id: number;
  name: string;
}

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFilters = useCallback(async () => {
    try {
      const [semestersRes, yearsRes] = await Promise.all([
        api.get<{ success: boolean; data: SemesterOption[] }>("/semesters"),
        api.get<{ success: boolean; data: AcademicYearOption[] }>("/academic-years"),
      ]);
      if (semestersRes.data) setSemesters(semestersRes.data);
      if (yearsRes.data) setAcademicYears(yearsRes.data);
    } catch {
      // optional
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const params: Record<string, number | undefined> = {};
      if (selectedSemester != null) params.semester_id = selectedSemester;
      if (selectedAcademicYear != null) params.academic_year_id = selectedAcademicYear;

      const [gradesRes, summaryRes] = await Promise.all([
        api.get<{ success: boolean; data: GradeRow[] }>(STUDENTS.GRADES, params),
        api.get<{ success: boolean; data: Summary }>(
          `${STUDENTS.GRADES}/summary`,
          params,
        ),
      ]);
      setGrades(gradesRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      const msg = toApiError(err).message;
      setError(msg);
      toast.error("Gagal memuat nilai", { description: msg });
    } finally {
      setLoading(false);
    }
  }, [selectedSemester, selectedAcademicYear]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [selectedSemester, selectedAcademicYear, load]);

  const semesterOptions = useMemo(
    () => [
      { value: "", label: "Semua" },
      ...semesters.map((s) => ({ value: s.id, label: s.name })),
    ],
    [semesters],
  );

  const academicYearOptions = useMemo(
    () => [
      { value: "", label: "Semua" },
      ...academicYears.map((y) => ({ value: y.id, label: y.name })),
    ],
    [academicYears],
  );

  const columns = useMemo(
    () => [
      { header: "Mata Pelajaran", accessor: "subject_name" as const },
      { header: "Tugas", accessor: "tugas" as const, render: (v: unknown) => String(v ?? "-") },
      { header: "UTS", accessor: "uts" as const, render: (v: unknown) => String(v ?? "-") },
      { header: "UAS", accessor: "uas" as const, render: (v: unknown) => String(v ?? "-") },
      {
        header: "Nilai Akhir",
        accessor: "final_score" as const,
        render: (v: unknown) => (v != null ? String(v) : "-"),
        className: "px-6 py-4 text-sm font-semibold text-on-surface",
      },
    ],
    [],
  );

  if (!loading && error) {
    return (
      <PageContainer>
        <PageHeader title="Nilai" description="Nilai akademik Anda" />
        <PortalErrorState message={error ?? ""} onRetry={load} />
      </PageContainer>
    );
  }

  if (!loading && grades.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Nilai" description="Nilai akademik Anda" />
        <PortalEmptyState icon={<BookOpen />} description="Belum ada nilai." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Nilai" description="Nilai akademik Anda" />

      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
        <PortalStatCard
          icon={<TrendingUp />}
          label="Rata-rata"
          value={summary?.average.toFixed(1) ?? "-"}
        />
        <PortalStatCard
          icon={<Award />}
          label="Tertinggi"
          value={summary?.highest ?? "-"}
        />
        <PortalStatCard
          icon={<BookOpen />}
          label="Mata Pelajaran"
          value={summary?.total_subjects ?? "-"}
        />
      </div>

      <PortalFilterBar>
          <label className="text-sm font-medium text-secondary">Tahun Ajaran:</label>
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <AppSelect<number | string>
              options={academicYearOptions}
              value={selectedAcademicYear ?? ""}
              onChange={(v) => setSelectedAcademicYear(v === "" || v == null ? null : Number(v))}
              placeholder="Pilih tahun ajaran..."
            />
          </div>
          <label className="text-sm font-medium text-secondary">Semester:</label>
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <AppSelect<number | string>
              options={semesterOptions}
              value={selectedSemester ?? ""}
              onChange={(v) => setSelectedSemester(v === "" || v == null ? null : Number(v))}
              placeholder="Pilih semester..."
            />
          </div>
        </PortalFilterBar>

      <DataTable
        columns={columns}
        data={grades}
        loading={loading}
        emptyMessage="Belum ada nilai."
      />
    </PageContainer>
  );
}
