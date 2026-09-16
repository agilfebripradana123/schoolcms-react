import { useCallback, useEffect, useState } from "react";
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

interface FeeType {
  id: number;
  name?: string | null;
  description?: string | null;
  amount?: number | string | null;
}

export default function TeacherFinancePage() {
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [filtered, setFiltered] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: FeeType[] }>("/teacher/finance/fee-types")
      .then((res) => {
        const items = res.data.data ?? [];
        setFeeTypes(items);
        setFiltered(items);
      })
      .catch((err) => setError(toApiError(err).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(feeTypes);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      feeTypes.filter(
        (f) =>
          (f.name && f.name.toLowerCase().includes(q)) ||
          (f.description && f.description.toLowerCase().includes(q))
      )
    );
  }, [search, feeTypes]);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Keuangan" description="Ringkasan jenis tagihan untuk Portal Guru." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Keuangan" description="Ringkasan jenis tagihan untuk Portal Guru." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (feeTypes.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Keuangan" description="Ringkasan jenis tagihan untuk Portal Guru." />
        <PortalEmptyState icon={<DollarSign />} description="Belum ada data jenis tagihan." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Keuangan" description="Ringkasan jenis tagihan untuk Portal Guru." />

      <div className="mb-4">
        <Search value={search} onChange={setSearch} placeholder="Cari nama atau deskripsi..." />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Card>
          <DataTable
            columns={[
              { accessor: "name" as keyof FeeType, header: "Nama", render: (_val, f) => f.name ?? "—" },
              { accessor: "description" as keyof FeeType, header: "Deskripsi", render: (_val, f) => f.description ?? "—" },
              { accessor: "amount" as keyof FeeType, header: "Jumlah", render: (_val, f) => f.amount ?? "—" },
            ]}
            data={filtered}
          />
        </Card>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((f) => (
          <Card key={f.id} className="p-4 rounded-2xl border border-outline-variant">
            <div className="space-y-2">
              <p className="font-semibold text-primary">{f.name ?? "—"}</p>
              <p className="text-sm text-secondary">{f.description ?? "—"}</p>
              <p className="text-sm text-secondary">Jumlah: {f.amount ?? "—"}</p>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && feeTypes.length > 0 && (
        <PortalEmptyState icon={<DollarSign />} description="Tidak ada jenis tagihan yang sesuai dengan pencarian." />
      )}
    </PageContainer>
  );
}
