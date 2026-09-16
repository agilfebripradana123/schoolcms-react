import { useCallback, useEffect, useRef, useState } from "react";
import { DollarSign } from "lucide-react";
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

interface Transaction {
  id: number;
  type?: string | null;
  amount?: number | string | null;
  date?: string | null;
  description?: string | null;
}

const tipeOptions: SelectOption<string>[] = [
  { value: "pemasukan", label: "Pemasukan" },
  { value: "pengeluaran", label: "Pengeluaran" },
];

export default function TeacherTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
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
      .get<{ data: Transaction[] }>("/teacher/payment-transactions", { params: { search: query.search || undefined, tipe: query.tipe || undefined } })
      .then((res) => {
        const items = res.data.data ?? [];
        setTransactions(items);
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
        <PageHeader title="Transaksi" description="Daftar transaksi pembayaran." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Transaksi" description="Daftar transaksi pembayaran." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (transactions.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Transaksi" description="Daftar transaksi pembayaran." />
        <PortalEmptyState icon={<DollarSign />} description="Belum ada data transaksi." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Transaksi" description="Daftar transaksi pembayaran." />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari tipe atau keterangan..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Tipe</span>
              <AppSelect options={tipeOptions} value={tipe} onChange={handleTipeChange} placeholder="Pilih Tipe" isSearchable={false} className="min-w-[180px]" />
            </label>
          </div>
        </div>

        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "type" as keyof Transaction, header: "Tipe", render: (_val, t) => t.type ?? "—" },
              { accessor: "amount" as keyof Transaction, header: "Jumlah", render: (_val, t) => t.amount ?? "—" },
              { accessor: "date" as keyof Transaction, header: "Tanggal", render: (_val, t) => t.date ?? "—" },
              { accessor: "description" as keyof Transaction, header: "Keterangan", render: (_val, t) => t.description ?? "—" },
            ]}
            data={filtered}
          />
        </div>

        <div className="md:hidden space-y-3">
          {filtered.map((t) => (
            <Card key={t.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <p className="font-semibold text-primary">{t.type ?? "—"}</p>
                <p className="text-sm text-secondary">Jumlah: {t.amount ?? "—"}</p>
                <p className="text-sm text-secondary">Tanggal: {t.date ?? "—"}</p>
                <p className="text-sm text-secondary">{t.description ?? "—"}</p>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && transactions.length > 0 && (
          <PortalEmptyState icon={<DollarSign />} description="Tidak ada transaksi yang sesuai dengan pencarian." />
        )}
      </Card>
    </PageContainer>
  );
}
