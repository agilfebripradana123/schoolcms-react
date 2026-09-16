import { useCallback, useEffect, useRef, useState } from "react";
import { Receipt } from "lucide-react";
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

interface Billing {
  id: number;
  name?: string | null;
  amount?: number | string | null;
  due_date?: string | null;
  status?: string | null;
}

const statusOptions: SelectOption<string>[] = [
  { value: "lunas", label: "Lunas" },
  { value: "belum lunas", label: "Belum Lunas" },
  { value: "jatu tempo", label: "Jatuh Tempo" },
];

export default function TeacherBillingsPage() {
  const [billings, setBillings] = useState<Billing[]>([]);
  const [filtered, setFiltered] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [query, setQuery] = useState<{ search: string; status: string | null }>({ search: "", status: null });

  const searchTimeout = useRef<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: Billing[] }>("/teacher/billings", { params: { search: query.search || undefined, status: query.status || undefined } })
      .then((res) => {
        const items = res.data.data ?? [];
        setBillings(items);
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

  const handleStatusChange = useCallback((value: string | null) => {
    setStatus(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, status: value }));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Tagihan" description="Daftar tagihan siswa." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Tagihan" description="Daftar tagihan siswa." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (billings.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Tagihan" description="Daftar tagihan siswa." />
        <PortalEmptyState icon={<Receipt />} description="Belum ada data tagihan." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Tagihan" description="Daftar tagihan siswa." />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari nama atau status..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Status</span>
              <AppSelect options={statusOptions} value={status} onChange={handleStatusChange} placeholder="Pilih Status" isSearchable={false} className="min-w-[180px]" />
            </label>
          </div>
        </div>

        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "name" as keyof Billing, header: "Nama", render: (_val, b) => b.name ?? "—" },
              { accessor: "amount" as keyof Billing, header: "Jumlah", render: (_val, b) => b.amount ?? "—" },
              { accessor: "due_date" as keyof Billing, header: "Jatuh Tempo", render: (_val, b) => b.due_date ?? "—" },
              {
                accessor: "status" as keyof Billing,
                header: "Status",
                render: (_val, b) => b.status ? <Badge variant="secondary">{b.status}</Badge> : <span className="text-secondary">—</span>,
              },
            ]}
            data={filtered}
          />
        </div>

        <div className="md:hidden space-y-3">
          {filtered.map((b) => (
            <Card key={b.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-primary">{b.name ?? "—"}</p>
                  {b.status && <Badge variant="secondary">{b.status}</Badge>}
                </div>
                <p className="text-sm text-secondary">Jumlah: {b.amount ?? "—"}</p>
                <p className="text-sm text-secondary">Jatuh Tempo: {b.due_date ?? "—"}</p>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && billings.length > 0 && (
          <PortalEmptyState icon={<Receipt />} description="Tidak ada tagihan yang sesuai dengan pencarian." />
        )}
      </Card>
    </PageContainer>
  );
}
