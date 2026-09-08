import { useCallback, useEffect, useState } from "react";
import { Dumbbell, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardBody } from "@/components/ui/Card";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import Badge from "@/components/ui/Badge";

interface ExtracurricularRow {
  id: number;
  name: string;
  description?: string | null;
  supervisor_id?: number | null;
  schedule_day?: string | null;
  is_active?: boolean;
}

export default function StudentExtracurricularPage() {
  const [rows, setRows] = useState<ExtracurricularRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: ExtracurricularRow[] }>(
        STUDENTS.EXTRACURRICULARS,
      );
      setRows(res.data ?? []);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      toast.error("Gagal memuat ekstrakurikuler", { description: apiErr.message });
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
        <PageHeader title="Ekstrakurikuler" description="Kegiatan ekstrakurikuler" />
        <PortalLoadingState message="Memuat..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Ekstrakurikuler" description="Kegiatan ekstrakurikuler" />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (rows.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Ekstrakurikuler" description="Kegiatan ekstrakurikuler" />
        <PortalEmptyState icon={<Dumbbell />} description="Belum ada kegiatan ekstrakurikuler." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Ekstrakurikuler" description={`Daftar ekstrakurikuler • ${rows.length} kegiatan`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((e) => (
          <Card key={e.id}>
            <CardBody>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 truncate">{e.name}</h3>
                  {e.is_active != null && (
                    <Badge variant={e.is_active ? "success" : "neutral"} className="mt-1">
                      {e.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  )}
                </div>
              </div>
              {e.description && (
                <p className="mt-3 text-sm text-slate-600 line-clamp-3">{e.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                {e.schedule_day && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {e.schedule_day}
                  </span>
                )}
                {e.supervisor_id != null && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Pembina #{e.supervisor_id}
                  </span>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}