import { useCallback, useEffect, useRef, useState } from "react";
import { PiggyBank } from "lucide-react";
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

interface FinanceSummary {
  id: number;
  description?: string | null;
  amount?: number | string | null;
}

const bulanOptions: SelectOption<string>[] = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export default function TeacherFinanceSummaryPage() {
  const [summaries, setSummaries] = useState<FinanceSummary[]>([]);
  const [filtered, setFiltered] = useState<FinanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [bulan, setBulan] = useState<string | null>(null);
  const [query, setQuery] = useState<{ search: string; bulan: string | null }>({ search: "", bulan: null });

  const searchTimeout = useRef<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: FinanceSummary[] }>("/teacher/finance/summary", { params: { search: query.search || undefined, bulan: query.bulan || undefined } })
      .then((res) => {
        const items = res.data.data ?? [];
        setSummaries(items);
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

  const handleBulanChange = useCallback((value: string | null) => {
    setBulan(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, bulan: value }));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Ringkasan Keuangan" description="Ringkasan data keuangan." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Ringkasan Keuangan" description="Ringkasan data keuangan." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (summaries.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Ringkasan Keuangan" description="Ringkasan data keuangan." />
        <PortalEmptyState icon={<PiggyBank />} description="Belum ada data keuangan." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Ringkasan Keuangan" description="Ringkasan data keuangan." />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari keterangan..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Bulan</span>
              <AppSelect options={bulanOptions} value={bulan} onChange={handleBulanChange} placeholder="Pilih Bulan" isSearchable={false} className="min-w-[180px]" />
            </label>
          </div>
        </div>

        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "description" as keyof FinanceSummary, header: "Keterangan", render: (_val, s) => s.description ?? "—" },
              { accessor: "amount" as keyof FinanceSummary, header: "Jumlah", render: (_val, s) => s.amount ?? "—" },
            ]}
            data={filtered}
          />
        </div>

        <div className="md:hidden space-y-3">
          {filtered.map((s) => (
            <Card key={s.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <p className="font-semibold text-primary">{s.description ?? "—"}</p>
                <p className="text-sm text-secondary">Jumlah: {s.amount ?? "—"}</p>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && summaries.length > 0 && (
          <PortalEmptyState icon={<PiggyBank />} description="Tidak ada data yang sesuai dengan pencarian." />
        )}
      </Card>
    </PageContainer>
  );
}
