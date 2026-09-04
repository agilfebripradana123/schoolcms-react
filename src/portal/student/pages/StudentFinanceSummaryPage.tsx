import { useCallback, useEffect, useState } from "react";
import { Wallet, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { toApiError } from "@/lib/api/error";
import { formatRupiah } from "@/lib/format";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardBody } from "@/components/ui/Card";
import PortalStatCard from "@/portal/components/PortalStatCard";
import PortalErrorState from "@/portal/components/PortalErrorState";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";

interface SummaryData {
  totals: {
    total_billed: number;
    total_paid: number;
    total_outstanding: number;
  };
}

export default function StudentFinanceSummaryPage() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: SummaryData }>(
        "/student/finance/summary",
      );
      setData(res.data);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      toast.error("Gagal memuat ringkasan keuangan", { description: apiErr.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totals = data?.totals;
  const outstanding = totals?.total_outstanding ?? 0;
  const billed = totals?.total_billed ?? 0;
  const percentage = billed > 0 ? Math.round(((totals?.total_paid ?? 0) / billed) * 100) : 0;

  const statusLabel = outstanding <= 0 ? "Lunas" : outstanding < billed ? "Sebagian" : "Belum lunas";
  const variant: "success" | "warning" | "danger" =
    outstanding <= 0 ? "success" : outstanding < billed ? "warning" : "danger";
  const progressTone =
    outstanding <= 0 ? "bg-emerald-600" : outstanding < billed ? "bg-amber-500" : "bg-rose-500";

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Ringkasan Keuangan" description="Ringkasan tagihan dan pembayaran Anda" />
        <DataTable columns={[]} data={[]} loading />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Ringkasan Keuangan" description="Ringkasan tagihan dan pembayaran Anda" />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Ringkasan Keuangan" description="Ringkasan tagihan dan pembayaran Anda" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <PortalStatCard
          icon={<CreditCard />}
          label="Total Tagihan"
          value={formatRupiah(totals?.total_billed) ?? "-"}
        />
        <PortalStatCard
          icon={<Wallet />}
          label="Total Dibayar"
          value={formatRupiah(totals?.total_paid) ?? "-"}
          valueClassName="text-emerald-600"
        />
        <PortalStatCard
          icon={<Wallet />}
          label="Sisa Tagihan"
          value={formatRupiah(totals?.total_outstanding) ?? "-"}
          valueClassName="text-rose-600"
        />
      </div>

      <Card>
        <CardBody>
          <h2 className="text-sm font-semibold text-slate-700">Status Pembayaran</h2>
          <div className="mt-3 flex items-center gap-3">
            <Badge variant={variant}>{statusLabel}</Badge>
            <span className="text-sm text-slate-500">{percentage}% dibayar</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-2 rounded-full transition-all ${progressTone}`} style={{ width: `${Math.min(percentage, 100)}%` }} aria-hidden />
          </div>
          <p className="mt-2 text-xs text-slate-400">Progress dari total dibayar terhadap total tagihan.</p>
        </CardBody>
      </Card>
    </PageContainer>
  );
}