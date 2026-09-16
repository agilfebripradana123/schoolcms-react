import { useCallback, useEffect, useRef, useState } from "react";
import { FileText } from "lucide-react";
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

interface Report {
  id: number;
  name?: string | null;
  type?: string | null;
  date?: string | null;
}

const tipeOptions: SelectOption<string>[] = [
  { value: "akademik", label: "Akademik" },
  { value: "keuangan", label: "Keuangan" },
  { value: "kepegawaian", label: "Kepegawaian" },
];

export default function TeacherReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filtered, setFiltered] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tipe, setTipe] = useState<string | null>(null);
  const [query, setQuery] = useState<{ search: string; tipe: string | null }>({ search: "", tipe: null });

  const searchTimeout = useRef<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: Report[] }>("/teacher/reports/academic", { params: { search: query.search || undefined, tipe: query.tipe || undefined } })
      .then((res) => {
        const items = res.data.data ?? [];
        setReports(items);
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

  const handleTipeChange = useCallback((value: string | null) => {
    setTipe(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, tipe: value }));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Laporan" description="Daftar laporan akademik untuk Portal Guru." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Laporan" description="Daftar laporan akademik untuk Portal Guru." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (reports.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Laporan" description="Daftar laporan akademik untuk Portal Guru." />
        <PortalEmptyState icon={<FileText />} description="Belum ada data laporan akademik." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Laporan" description="Daftar laporan akademik untuk Portal Guru." />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari nama atau tipe laporan..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Tipe</span>
              <AppSelect options={tipeOptions} value={tipe} onChange={handleTipeChange} placeholder="Pilih Tipe" isSearchable={false} className="min-w-[180px]" />
            </label>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "name" as keyof Report, header: "Nama Laporan", render: (_val, r) => r.name ?? "—" },
              {
                accessor: "type" as keyof Report,
                header: "Tipe",
                render: (_val, r) =>
                  r.type ? <Badge variant="secondary">{r.type}</Badge> : <span className="text-secondary">—</span>,
              },
              { accessor: "date" as keyof Report, header: "Tanggal", render: (_val, r) => r.date ?? "—" },
            ]}
            data={filtered}
          />
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((r) => (
            <Card key={r.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-primary">{r.name ?? "—"}</p>
                  {r.type && <Badge variant="secondary">{r.type}</Badge>}
                </div>
                <p className="text-sm text-secondary">Tanggal: {r.date ?? "—"}</p>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && reports.length > 0 && (
          <PortalEmptyState icon={<FileText />} description="Tidak ada laporan yang sesuai dengan pencarian." />
        )}
      </Card>
    </PageContainer>
  );
}
