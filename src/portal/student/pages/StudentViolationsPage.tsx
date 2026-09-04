import { useCallback, useEffect, useState } from "react";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";
import { formatDate } from "@/lib/format";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardBody } from "@/components/ui/Card";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import Badge from "@/components/ui/Badge";

interface ViolationRow {
  id: number;
  category: string;
  description: string;
  points: number;
  violated_at: string | null;
}

export default function StudentViolationsPage() {
  const [rows, setRows] = useState<ViolationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: ViolationRow[] }>(
        STUDENTS.VIOLATIONS,
      );
      setRows(res.data ?? []);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      toast.error("Gagal memuat pelanggaran", { description: apiErr.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Pelanggaran" description="Catatan pelanggaran" />
        <PortalLoadingState message="Memuat..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Pelanggaran" description="Catatan pelanggaran" />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  const totalPoints = rows.reduce((sum, v) => sum + (v.points ?? 0), 0);

  if (rows.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Pelanggaran" description="Catatan pelanggaran" />
        <PortalEmptyState
          icon={<ShieldAlert />}
          title="Tidak ada catatan pelanggaran"
          description="Pertahankan perilaku baik!"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Pelanggaran" description={`Catatan pelanggaran • Total poin: ${totalPoints}`} />

      <div className="space-y-3">
        {rows.map((v) => (
          <Card key={v.id} className="bg-amber-50/50 border-amber-200">
            <CardBody>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{v.category}</h3>
                    {v.points != null && <Badge variant="danger">-{v.points} poin</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{v.description}</p>
                  {v.violated_at && (
                    <p className="mt-2 text-xs text-slate-500">
                      Tanggal: {formatDate(v.violated_at)}
                    </p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}