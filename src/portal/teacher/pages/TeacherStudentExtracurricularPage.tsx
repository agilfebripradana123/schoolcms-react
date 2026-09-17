import { useCallback, useEffect, useRef, useState } from "react";
import { Dumbbell } from "lucide-react";
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

interface Extracurricular {
  id: number;
  name?: string | null;
  advisor?: string | null;
  schedule?: string | null;
}

const tahunOptions: SelectOption<string>[] = [
  { value: "2024/2025", label: "2024/2025" },
  { value: "2025/2026", label: "2025/2026" },
];

export default function TeacherStudentExtracurricularPage() {
  const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>([]);
  const [filtered, setFiltered] = useState<Extracurricular[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tahun, setTahun] = useState<string | null>(null);
  const [query, setQuery] = useState<{ search: string; tahun: string | null }>({ search: "", tahun: null });

  const searchTimeout = useRef<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: Extracurricular[] }>("/teacher/development/extracurriculars", { params: { search: query.search || undefined, tahun: query.tahun || undefined } })
      .then((res) => {
        const items = res.data.data ?? [];
        setExtracurriculars(items);
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

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Ekstrakurikuler" description="Daftar kegiatan ekstrakurikuler." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Ekstrakurikuler" description="Daftar kegiatan ekstrakurikuler." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (extracurriculars.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Ekstrakurikuler" description="Daftar kegiatan ekstrakurikuler." />
        <PortalEmptyState icon={<Dumbbell />} description="Belum ada data ekstrakurikuler." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Ekstrakurikuler" description="Daftar kegiatan ekstrakurikuler." />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari nama atau pembina..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Tahun Ajaran</span>
              <AppSelect options={tahunOptions} value={tahun} onChange={handleTahunChange} placeholder="Pilih Tahun Ajaran" isSearchable={false} className="min-w-[180px]" />
            </label>
          </div>
        </div>

        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "name" as keyof Extracurricular, header: "Nama", render: (_val, e) => e.name ?? "—" },
              { accessor: "advisor" as keyof Extracurricular, header: "Pembina", render: (_val, e) => e.advisor ?? "—" },
              { accessor: "schedule" as keyof Extracurricular, header: "Jadwal", render: (_val, e) => e.schedule ?? "—" },
            ]}
            data={filtered}
          />
        </div>

        <div className="md:hidden space-y-3">
          {filtered.map((e) => (
            <Card key={e.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <p className="font-semibold text-primary">{e.name ?? "—"}</p>
                <p className="text-sm text-secondary">Pembina: {e.advisor ?? "—"}</p>
                <p className="text-sm text-secondary">Jadwal: {e.schedule ?? "—"}</p>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && extracurriculars.length > 0 && (
          <PortalEmptyState icon={<Dumbbell />} description="Tidak ada ekstrakurikuler yang sesuai dengan pencarian." />
        )}
      </Card>
    </PageContainer>
  );
}
