import { useCallback, useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";
import apiClient from "@/lib/api/axios";
import { toApiError } from "@/lib/api";
import Card from "@/components/ui/Card";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import AppSelect from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";

interface Achievement {
  id: number;
  student_name?: string | null;
  achievement?: string | null;
  date?: string | null;
}

const tahunOptions: SelectOption<string>[] = [
  { value: "2024/2025", label: "2024/2025" },
  { value: "2025/2026", label: "2025/2026" },
];

const jenisOptions: SelectOption<string>[] = [
  { value: "akademik", label: "Akademik" },
  { value: "non-akademik", label: "Non-Akademik" },
];

export default function TeacherStudentAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filtered, setFiltered] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tahun, setTahun] = useState<string | null>(null);
  const [jenis, setJenis] = useState<string | null>(null);
  const [query, setQuery] = useState<{ search: string; tahun: string | null; jenis: string | null }>({ search: "", tahun: null, jenis: null });

  const searchTimeout = useRef<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: Achievement[] }>("/teacher/development/achievements", { params: { search: query.search || undefined, tahun: query.tahun || undefined, jenis: query.jenis || undefined } })
      .then((res) => {
        const items = res.data.data ?? [];
        setAchievements(items);
        setFiltered(items);
      })
      .catch((err) => setError(toApiError(err).message))
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    searchTimeout.current = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      setQuery((prev) => ({ ...prev, search: value }));
    }, 400);
  }, []);

  const handleTahunChange = useCallback((value: string | null) => {
    setTahun(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, tahun: value }));
  }, []);

  const handleJenisChange = useCallback((value: string | null) => {
    setJenis(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, jenis: value }));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Prestasi Siswa" description="Daftar prestasi siswa." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Prestasi Siswa" description="Daftar prestasi siswa." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (achievements.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Prestasi Siswa" description="Daftar prestasi siswa." />
        <PortalEmptyState icon={<Trophy />} description="Belum ada data prestasi." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Prestasi Siswa" description="Daftar prestasi siswa." />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari nama siswa atau prestasi..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Tahun</span>
              <AppSelect options={tahunOptions} value={tahun} onChange={handleTahunChange} placeholder="Pilih Tahun" isSearchable={false} className="min-w-[180px]" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Jenis</span>
              <AppSelect options={jenisOptions} value={jenis} onChange={handleJenisChange} placeholder="Pilih Jenis" isSearchable={false} className="min-w-[180px]" />
            </label>
          </div>
        </div>

        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "student_name" as keyof Achievement, header: "Nama Siswa", render: (_val, a) => a.student_name ?? "—" },
              { accessor: "achievement" as keyof Achievement, header: "Prestasi", render: (_val, a) => a.achievement ?? "—" },
              { accessor: "date" as keyof Achievement, header: "Tanggal", render: (_val, a) => a.date ?? "—" },
            ]}
            data={filtered}
          />
        </div>

        <div className="md:hidden space-y-3">
          {filtered.map((a) => (
            <Card key={a.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <p className="font-semibold text-primary">{a.student_name ?? "—"}</p>
                <p className="text-sm text-secondary">{a.achievement ?? "—"}</p>
                <p className="text-sm text-secondary">Tanggal: {a.date ?? "—"}</p>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && achievements.length > 0 && (
          <PortalEmptyState icon={<Trophy />} description="Tidak ada prestasi yang sesuai dengan pencarian." />
        )}
      </Card>
    </PageContainer>
  );
}
