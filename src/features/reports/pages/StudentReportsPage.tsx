import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { reportService } from "../api/report.service";
import type { StudentReportSummary } from "../api/types";

export default function StudentReportsPage() {
  const [data, setData] = useState<StudentReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchSummary = useCallback(() => {
    let active = true;

    reportService
      .studentSummary()
      .then((res) => {
        if (!active) return;
        setData(res.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(toApiError(err));
        toast.error("Gagal memuat laporan siswa", {
          description: toApiError(err).message,
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return fetchSummary();
  }, [fetchSummary]);

  type PerClassRow = StudentReportSummary["per_class"][number];

  const perClassColumns = [
    {
      header: "Kelas",
      accessor: "class_name" as keyof PerClassRow,
      render: (_value: unknown, row: PerClassRow) => (
        <span className="text-sm font-medium text-on-surface">{row.class_name}</span>
      ),
    },
    {
      header: "Jumlah Siswa",
      accessor: "total_students" as keyof PerClassRow,
      className: "px-6 py-4 text-center text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
      render: (_value: unknown, row: PerClassRow) => (
        <span className="text-sm text-slate-700">{row.total_students}</span>
      ),
    },
  ];

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Laporan Siswa"
        description="Ringkasan jumlah siswa per kelas dan distribusi gender."
      />

      {loading ? (
        <Card>
          <div className="py-10 text-center text-sm text-slate-500">Memuat data...</div>
        </Card>
      ) : error || !data ? (
        <Card>
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">
              {error?.message ?? "Gagal memuat laporan siswa."}
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchSummary();
              }}
            >
              Muat Ulang
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-surface-container-lowest p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
              <p className="text-sm font-medium text-on-surface-variant">Total Siswa</p>
              <p className="mt-3 font-display text-3xl font-bold tracking-tight text-on-surface">
                {data.totals.total_students}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-surface-container-lowest p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
              <p className="text-sm font-medium text-on-surface-variant">Total Kelas</p>
              <p className="mt-3 font-display text-3xl font-bold tracking-tight text-on-surface">
                {data.totals.total_classes}
              </p>
            </div>
          </div>

          <Card className="mt-6">
            <h3 className="mb-4 font-display text-base font-semibold text-on-surface">
              Distribusi Gender
            </h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="primary">
                Laki-laki: {data.gender_distribution.L}
              </Badge>
              <Badge variant="neutral">
                Perempuan: {data.gender_distribution.P}
              </Badge>
            </div>
          </Card>

          <Card className="mt-6">
            <h3 className="mb-4 font-display text-base font-semibold text-on-surface">
              Siswa per Kelas
            </h3>
            <DataTable
              columns={perClassColumns}
              data={data.per_class}
              emptyMessage="Belum ada data siswa."
            />
          </Card>
        </>
      )}
    </PageContainer>
  );
}