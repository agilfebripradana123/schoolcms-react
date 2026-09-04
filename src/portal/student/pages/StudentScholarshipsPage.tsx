import { useCallback, useEffect, useState } from "react";
import { Award } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { toApiError } from "@/lib/api/error";
import { formatDate, formatRupiah } from "@/lib/format";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardBody } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import PortalDetailRows from "@/portal/components/PortalDetailRows";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import Button from "@/components/ui/Button";

interface ScholarshipRow {
  id: number;
  name: string;
  provider?: string | null;
  amount?: number | null;
  status: "aktif" | "selesai" | "dibatalkan" | string;
  start_date?: string | null;
  end_date?: string | null;
}

function statusBadge(v: string): { label: string; variant: "success" | "warning" | "danger" | "neutral" } {
  if (v === "aktif") return { label: "Aktif", variant: "success" };
  if (v === "selesai") return { label: "Selesai", variant: "neutral" };
  if (v === "dibatalkan") return { label: "Dibatalkan", variant: "danger" };
  return { label: v, variant: "neutral" };
}

function ScholarshipDetailDialog({
  scholarship,
  onClose,
}: {
  scholarship: ScholarshipRow;
  onClose: () => void;
}) {
  const badge = statusBadge(scholarship.status);
  return (
    <Modal open onClose={onClose} title={scholarship.name}>
      <div className="flex items-center gap-3 mb-4">
        <Award className="h-8 w-8 text-amber-500" />
        <span className="text-sm text-slate-500">{scholarship.provider ?? "Sekolah"}</span>
      </div>
      <PortalDetailRows
        rows={[
          ...(scholarship.amount != null
            ? [{ label: "Nominal", value: formatRupiah(scholarship.amount) }]
            : []),
          {
            label: "Status",
            value: <Badge variant={badge.variant}>{badge.label}</Badge>,
          },
          ...(scholarship.start_date
            ? [{ label: "Mulai", value: formatDate(scholarship.start_date) }]
            : []),
          ...(scholarship.end_date
            ? [{ label: "Berakhir", value: formatDate(scholarship.end_date) }]
            : []),
        ]}
      />
      <div className="mt-6 flex justify-end">
        <Button variant="ghost" onClick={onClose}>Tutup</Button>
      </div>
    </Modal>
  );
}

export default function StudentScholarshipsPage() {
  const [rows, setRows] = useState<ScholarshipRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<ScholarshipRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: ScholarshipRow[] }>(
        "/student/finance/scholarships",
      );
      setRows(res.data ?? []);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      toast.error("Gagal memuat beasiswa", { description: apiErr.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const fetchDetail = async (id: number) => {
    try {
      const res = await api.get<{ success: boolean; data: ScholarshipRow }>(
        `/student/finance/scholarships/${id}`,
      );
      setDetail(res.data);
    } catch (err) {
      toast.error("Gagal memuat detail beasiswa", { description: toApiError(err).message });
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Beasiswa" description="Beasiswa yang Anda terima" />
        <PortalLoadingState message="Memuat..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Beasiswa" description="Beasiswa yang Anda terima" />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (rows.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Beasiswa" description="Beasiswa yang Anda terima" />
        <PortalEmptyState icon={<Award />} description="Belum ada beasiswa." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Beasiswa" description="Beasiswa yang Anda terima" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => {
          const badge = statusBadge(row.status);
          return (
            <Card key={row.id} className="cursor-pointer hover:shadow-md hover:border-primary-300 transition" onClick={() => fetchDetail(row.id)}>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{row.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{row.provider ?? "Sekolah"}</p>
                  </div>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
                {row.amount != null && (
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-sm text-slate-400">Nominal</span>
                    <span className="text-lg font-bold text-slate-900">{formatRupiah(row.amount)}</span>
                  </div>
                )}
                {(row.start_date || row.end_date) && (
                  <div className="mt-3 text-[11px] text-slate-400">
                    {row.start_date && <>Mulai: {formatDate(row.start_date)}{row.end_date && " · "}</>}
                    {row.end_date && <span>Berakhir: {formatDate(row.end_date)}</span>}
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {detail && <ScholarshipDetailDialog scholarship={detail} onClose={() => setDetail(null)} />}
    </PageContainer>
  );
}