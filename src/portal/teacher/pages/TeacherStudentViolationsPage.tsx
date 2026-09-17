import { useCallback, useEffect, useRef, useState } from "react";
import { ShieldAlert } from "lucide-react";
import apiClient from "@/lib/api/axios";
import { toApiError } from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import AppSelect from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";

interface Violation {
  id: number;
  student_name?: string | null;
  violation?: string | null;
  date?: string | null;
  level?: string | null;
}

const tahunOptions: SelectOption<string>[] = [
  { value: "2024/2025", label: "2024/2025" },
  { value: "2025/2026", label: "2025/2026" },
];

const tingkatOptions: SelectOption<string>[] = [
  { value: "ringan", label: "Ringan" },
  { value: "sedang", label: "Sedang" },
  { value: "berat", label: "Berat" },
];

export default function TeacherStudentViolationsPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [filtered, setFiltered] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tahun, setTahun] = useState<string | null>(null);
  const [tingkat, setTingkat] = useState<string | null>(null);
  const [query, setQuery] = useState<{ search: string; tahun: string | null; tingkat: string | null }>({ search: "", tahun: null, tingkat: null });

  const searchTimeout = useRef<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: Violation[] }>("/teacher/development/violations", { params: { search: query.search || undefined, tahun: query.tahun || undefined, tingkat: query.tingkat || undefined } })
      .then((res) => {
        const items = res.data.data ?? [];
        setViolations(items);
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

  const handleTingkatChange = useCallback((value: string | null) => {
    setTingkat(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, tingkat: value }));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Pelanggaran Siswa" description="Daftar pelanggaran siswa." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Pelanggaran Siswa" description="Daftar pelanggaran siswa." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (violations.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Pelanggaran Siswa" description="Daftar pelanggaran siswa." />
        <PortalEmptyState icon={<ShieldAlert />} description="Belum ada data pelanggaran." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Pelanggaran Siswa" description="Daftar pelanggaran siswa." />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari nama siswa atau pelanggaran..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Tahun</span>
              <AppSelect options={tahunOptions} value={tahun} onChange={handleTahunChange} placeholder="Pilih Tahun" isSearchable={false} className="min-w-[180px]" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Tingkat</span>
              <AppSelect options={tingkatOptions} value={tingkat} onChange={handleTingkatChange} placeholder="Pilih Tingkat" isSearchable={false} className="min-w-[180px]" />
            </label>
          </div>
        </div>

        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "student_name" as keyof Violation, header: "Nama Siswa", render: (_val, v) => v.student_name ?? "—" },
              { accessor: "violation" as keyof Violation, header: "Pelanggaran", render: (_val, v) => v.violation ?? "—" },
              { accessor: "date" as keyof Violation, header: "Tanggal", render: (_val, v) => v.date ?? "—" },
              {
                accessor: "level" as keyof Violation,
                header: "Tingkat",
                render: (_val, v) => v.level ? <Badge variant="danger">{v.level}</Badge> : <span className="text-secondary">—</span>,
              },
            ]}
            data={filtered}
          />
        </div>

        <div className="md:hidden space-y-3">
          {filtered.map((v) => (
            <Card key={v.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-primary">{v.student_name ?? "—"}</p>
                  {v.level && <Badge variant="danger">{v.level}</Badge>}
                </div>
                <p className="text-sm text-secondary">{v.violation ?? "—"}</p>
                <p className="text-sm text-secondary">Tanggal: {v.date ?? "—"}</p>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && violations.length > 0 && (
          <PortalEmptyState icon={<ShieldAlert />} description="Tidak ada pelanggaran yang sesuai dengan pencarian." />
        )}
      </Card>
    </PageContainer>
  );
}
