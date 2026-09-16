import { useCallback, useEffect, useRef, useState } from "react";
import { Wallet } from "lucide-react";
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

interface Payment {
  id: number;
  name?: string | null;
  amount?: number | string | null;
  date?: string | null;
  method?: string | null;
}

const metodeOptions: SelectOption<string>[] = [
  { value: "transfer", label: "Transfer" },
  { value: "tunai", label: "Tunai" },
  { value: "qris", label: "QRIS" },
];

export default function TeacherPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filtered, setFiltered] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [metode, setMetode] = useState<string | null>(null);
  const [query, setQuery] = useState<{ search: string; metode: string | null }>({ search: "", metode: null });

  const searchTimeout = useRef<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: Payment[] }>("/teacher/payments", { params: { search: query.search || undefined, metode: query.metode || undefined } })
      .then((res) => {
        const items = res.data.data ?? [];
        setPayments(items);
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

  const handleMetodeChange = useCallback((value: string | null) => {
    setMetode(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, metode: value }));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Pembayaran" description="Daftar pembayaran siswa." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Pembayaran" description="Daftar pembayaran siswa." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (payments.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Pembayaran" description="Daftar pembayaran siswa." />
        <PortalEmptyState icon={<Wallet />} description="Belum ada data pembayaran." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Pembayaran" description="Daftar pembayaran siswa." />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari nama atau metode..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Metode</span>
              <AppSelect options={metodeOptions} value={metode} onChange={handleMetodeChange} placeholder="Pilih Metode" isSearchable={false} className="min-w-[180px]" />
            </label>
          </div>
        </div>

        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "name" as keyof Payment, header: "Nama", render: (_val, p) => p.name ?? "—" },
              { accessor: "amount" as keyof Payment, header: "Jumlah", render: (_val, p) => p.amount ?? "—" },
              { accessor: "date" as keyof Payment, header: "Tanggal", render: (_val, p) => p.date ?? "—" },
              { accessor: "method" as keyof Payment, header: "Metode", render: (_val, p) => p.method ?? "—" },
            ]}
            data={filtered}
          />
        </div>

        <div className="md:hidden space-y-3">
          {filtered.map((p) => (
            <Card key={p.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <p className="font-semibold text-primary">{p.name ?? "—"}</p>
                <p className="text-sm text-secondary">Jumlah: {p.amount ?? "—"}</p>
                <p className="text-sm text-secondary">Tanggal: {p.date ?? "—"}</p>
                <p className="text-sm text-secondary">Metode: {p.method ?? "—"}</p>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && payments.length > 0 && (
          <PortalEmptyState icon={<Wallet />} description="Tidak ada pembayaran yang sesuai dengan pencarian." />
        )}
      </Card>
    </PageContainer>
  );
}
