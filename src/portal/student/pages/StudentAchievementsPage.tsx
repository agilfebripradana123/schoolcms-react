import { useCallback, useEffect, useState } from "react";
import { Award, Calendar } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";
import { formatDate } from "@/lib/format";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardBody } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import PortalErrorState from "@/portal/components/PortalErrorState";

interface AchievementRow {
  id: number;
  title: string;
  level?: string | null;
  organizer?: string | null;
  achievement_date?: string | null;
  description?: string | null;
}

export default function StudentAchievementsPage() {
  const [rows, setRows] = useState<AchievementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: AchievementRow[] }>(
        STUDENTS.ACHIEVEMENTS,
      );
      setRows(res.data ?? []);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      toast.error("Gagal memuat prestasi", { description: apiErr.message });
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
        <PageHeader title="Prestasi" description="Prestasi yang Anda raih" />
        <PortalLoadingState message="Memuat..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Prestasi" description="Prestasi yang Anda raih" />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (rows.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Prestasi" description="Prestasi yang Anda raih" />
        <PortalEmptyState icon={<Award />} description="Belum ada prestasi." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Prestasi" description="Prestasi yang Anda raih" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((a) => (
          <Card key={a.id}>
            <CardBody>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <Award className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 truncate">{a.title}</h3>
                  {a.organizer && (
                    <p className="text-sm text-slate-500 truncate">{a.organizer}</p>
                  )}
                </div>
              </div>
              {a.level && <Badge variant="primary" className="mt-3">{a.level}</Badge>}
              {a.description && (
                <p className="mt-2 text-sm text-slate-600 line-clamp-3">{a.description}</p>
              )}
              {a.achievement_date && (
                <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="h-3 w-3" />
                  {formatDate(a.achievement_date)}
                </p>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}