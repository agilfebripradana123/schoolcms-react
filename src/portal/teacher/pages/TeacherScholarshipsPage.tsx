import { useCallback, useEffect, useRef, useState } from "react";
import { GraduationCap } from "lucide-react";
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

interface Scholarship {
  id: number;
  name?: string | null;
  description?: string | null;
  amount?: number | string | null;
}

const tahunOptions: SelectOption<string>[] = [
  { value: "2024/2025", label: "2024/2025" },
  { value: "2025/2026", label: "2025/2026" },
];

export default function TeacherScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [filtered, setFiltered] = useState<Scholarship[]>([]);
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
      .get<{ data: Scholarship[] }>("/teacher/finance/scholarships", { params: { search: query.search || undefined, tahun: query.tahun || undefined } })
      .then((res) => {
        const items = res.data.data ?? [];
        setScholarships(items);
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
        <PageHeader title="Beasiswa" description="Daftar beasiswa untuk Portal Guru." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Beasiswa" description="Daftar beasiswa untuk Portal Guru." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (scholarships.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Beasiswa" description="Daftar beasiswa untuk Portal Guru." />
        <PortalEmptyState icon={<GraduationCap />} description="Belum ada data beasiswa." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Beasiswa" description="Daftar beasiswa untuk Portal Guru." />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari nama atau deskripsi..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Tahun Ajaran</span>
              <AppSelect options={tahunOptions} value={tahun} onChange={handleTahunChange} placeholder="Pilih Tahun Ajaran" isSearchable={false} className="min-w-[180px]" />
            </label>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "name" as keyof Scholarship, header: "Nama", render: (_val, s) => s.name ?? "—" },
              { accessor: "description" as keyof Scholarship, header: "Deskripsi", render: (_val, s) => s.description ?? "—" },
              { accessor: "amount" as keyof Scholarship, header: "Jumlah", render: (_val, s) => s.amount ?? "—" },
            ]}
            data={filtered}
          />
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((s) => (
            <Card key={s.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <p className="font-semibold text-primary">{s.name ?? "—"}</p>
                <p className="text-sm text-secondary">{s.description ?? "—"}</p>
                <p className="text-sm text-secondary">Jumlah: {s.amount ?? "—"}</p>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && scholarships.length > 0 && (
          <PortalEmptyState icon={<GraduationCap />} description="Tidak ada beasiswa yang sesuai dengan pencarian." />
        )}
      </Card>
    </PageContainer>
  );
}
