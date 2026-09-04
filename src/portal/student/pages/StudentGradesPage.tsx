import { useCallback, useEffect, useMemo, useState } from "react";
import { TrendingUp, BookOpen, Award } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardBody } from "@/components/ui/Card";
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

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSemesters = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: SemesterOption[] }>("/semesters");
      if (res.data) setSemesters(res.data);
    } catch {
      // optional
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const [gradesRes, summaryRes] = await Promise.all([
        api.get<{ success: boolean; data: GradeRow[] }>(STUDENTS.GRADES, {
          semester_id: selectedSemester ?? undefined,
        }),
        api.get<{ success: boolean; data: Summary }>(
          `${STUDENTS.GRADES}/summary`,
          { semester_id: selectedSemester ?? undefined },
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
  }, [selectedSemester]);

  useEffect(() => {
    loadSemesters();
  }, [loadSemesters]);

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSemester]);

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
        className: "px-6 py-4 text-sm font-semibold text-slate-900",
      },
    ],
    [],
  );

  if (!loading && error) {
    return (
      <PageContainer>
        <PageHeader title="Nilai" description="Nilai akademik Anda" />
        <Card>
          <CardBody className="text-sm text-red-600">{error}</CardBody>
        </Card>
      </PageContainer>
    );
  }

  if (!loading && grades.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Nilai" description="Nilai akademik Anda" />
        <Card>
          <CardBody className="p-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-400">Belum ada nilai.</p>
          </CardBody>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Nilai" description="Nilai akademik Anda" />

      <Card className="mb-6">
        <CardBody className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-slate-700">Semester:</label>
          <div className="min-w-[200px]">
            <AppSelect<number | string>
              options={[
                { value: "", label: "Semua" },
                ...semesters.map((s) => ({ value: s.id, label: s.name })),
              ]}
              value={selectedSemester ?? ""}
              onChange={(v) => setSelectedSemester(v === "" || v == null ? null : Number(v))}
              placeholder="Pilih semester..."
            />
          </div>
        </CardBody>
      </Card>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rata-rata</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {summary?.average.toFixed(1) ?? "-"}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tertinggi</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary?.highest ?? "-"}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mata Pelajaran</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {summary?.total_subjects ?? "-"}
            </p>
          </CardBody>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={grades}
        loading={loading}
        emptyMessage="Belum ada nilai."
      />
    </PageContainer>
  );
}