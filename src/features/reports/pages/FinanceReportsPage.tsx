import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import { FormField, Input } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { ApiError } from "@/types";
import { reportService } from "../api/report.service";
import type { FinanceReportSummary } from "../api/types";
import { academicYearService } from "@/features/academic/api/academic-year.service";
import { semesterService } from "@/features/academic/api/semester.service";
import { feeTypeService } from "@/features/finance/api/fee-type.service";
import type { AcademicYear } from "@/features/academic/api/types";
import type { Semester } from "@/features/academic/api/types";
import type { FeeType } from "@/features/finance/api/types";

function formatMonth(month: string): string {
  const [year, monthIndex] = month.split("-").map(Number);
  if (!year || !monthIndex) return month;
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex - 1, 1));
}

export default function FinanceReportsPage() {
  const [data, setData] = useState<FinanceReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [feeTypeFilter, setFeeTypeFilter] = useState("all");

  const [query, setQuery] = useState<{
    date_from: string | undefined;
    date_to: string | undefined;
    academic_year_id: number | undefined;
    semester_id: number | undefined;
    fee_type_id: number | undefined;
  }>({
    date_from: undefined,
    date_to: undefined,
    academic_year_id: undefined,
    semester_id: undefined,
    fee_type_id: undefined,
  });

  const fetchFilters = useCallback(() => {
    let active = true;

    Promise.all([
      academicYearService.list({ per_page: 100 }),
      semesterService.list({ per_page: 100 }),
      feeTypeService.list({ per_page: 100 }),
    ])
      .then(([yearsRes, semestersRes, feeTypesRes]) => {
        if (!active) return;
        setAcademicYears(yearsRes.data);
        setSemesters(semestersRes.data);
        setFeeTypes(feeTypesRes.data);
      })
      .catch(() => {
        // Filter relasi opsional; ringkasan tetap dapat dimuat.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return fetchFilters();
  }, [fetchFilters]);

  const fetchSummary = useCallback(() => {
    let active = true;

    reportService
      .financeSummary(query)
      .then((res) => {
        if (!active) return;
        setData(res.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(toApiError(err));
        setData(null);
        toast.error("Gagal memuat laporan keuangan", {
          description: toApiError(err).message,
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  useEffect(() => {
    return fetchSummary();
  }, [fetchSummary]);

  const handleApply = useCallback(() => {
    setLoading(true);
    setError(null);
    setQuery({
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      academic_year_id: academicYearFilter === "all" ? undefined : Number(academicYearFilter),
      semester_id: semesterFilter === "all" ? undefined : Number(semesterFilter),
      fee_type_id: feeTypeFilter === "all" ? undefined : Number(feeTypeFilter),
    });
  }, [dateFrom, dateTo, academicYearFilter, semesterFilter, feeTypeFilter]);

  const academicYearOptions = useMemo(
    () => [
      { value: "all", label: "Semua Tahun Ajaran" },
      ...academicYears.map((y) => ({ value: String(y.id), label: y.name })),
    ],
    [academicYears],
  );

  const semesterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Semester" },
      ...semesters.map((s) => ({ value: String(s.id), label: s.name })),
    ],
    [semesters],
  );

  const feeTypeOptions = useMemo(
    () => [
      { value: "all", label: "Semua Jenis Tagihan" },
      ...feeTypes.map((f) => ({ value: String(f.id), label: f.name })),
    ],
    [feeTypes],
  );

  const feeTypeColumns = [
    {
      header: "Jenis Tagihan",
      accessor: "fee_type_name" as keyof FinanceReportSummary["per_fee_type"][number],
      render: (
        _value: unknown,
        row: FinanceReportSummary["per_fee_type"][number],
      ) => (
        <span className="text-sm font-medium text-on-surface">
          {row.fee_type_name || "-"}
        </span>
      ),
    },
    {
      header: "Ditagih",
      accessor: "total_billed" as keyof FinanceReportSummary["per_fee_type"][number],
      className: "px-6 py-4 text-right text-sm text-slate-700 whitespace-nowrap",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
      render: (
        _value: unknown,
        row: FinanceReportSummary["per_fee_type"][number],
      ) => (
        <span className="whitespace-nowrap text-sm text-slate-700">
          {formatCurrency(row.total_billed)}
        </span>
      ),
    },
    {
      header: "Dibayar",
      accessor: "total_paid" as keyof FinanceReportSummary["per_fee_type"][number],
      className: "px-6 py-4 text-right text-sm text-slate-700 whitespace-nowrap",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
      render: (
        _value: unknown,
        row: FinanceReportSummary["per_fee_type"][number],
      ) => (
        <span className="whitespace-nowrap text-sm text-slate-700">
          {formatCurrency(row.total_paid)}
        </span>
      ),
    },
  ];

  const trendColumns = [
    {
      header: "Bulan",
      accessor: "month" as keyof FinanceReportSummary["monthly_trend"][number],
      render: (
        _value: unknown,
        row: FinanceReportSummary["monthly_trend"][number],
      ) => (
        <span className="text-sm font-medium text-on-surface">
          {formatMonth(row.month)}
        </span>
      ),
    },
    {
      header: "Total Dibayar",
      accessor: "total_paid" as keyof FinanceReportSummary["monthly_trend"][number],
      className: "px-6 py-4 text-right text-sm text-slate-700 whitespace-nowrap",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
      render: (
        _value: unknown,
        row: FinanceReportSummary["monthly_trend"][number],
      ) => (
        <span className="whitespace-nowrap text-sm text-slate-700">
          {formatCurrency(row.total_paid)}
        </span>
      ),
    },
  ];

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Laporan Keuangan"
        description="Ringkasan tagihan, pembayaran, dan tren penerimaan keuangan."
      />

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <FormField label="Dari Tanggal" className="flex flex-col gap-1">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </FormField>
          <FormField label="Sampai Tanggal" className="flex flex-col gap-1">
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </FormField>
          <FormField label="Tahun Ajaran" className="flex flex-col gap-1">
            <AppSelect
              options={academicYearOptions}
              value={academicYearFilter}
              onChange={(v) => setAcademicYearFilter(v ?? "all")}
              placeholder="Pilih Tahun Ajaran"
            />
          </FormField>
          <FormField label="Semester" className="flex flex-col gap-1">
            <AppSelect
              options={semesterOptions}
              value={semesterFilter}
              onChange={(v) => setSemesterFilter(v ?? "all")}
              placeholder="Pilih Semester"
            />
          </FormField>
          <FormField label="Jenis Tagihan" className="flex flex-col gap-1">
            <AppSelect
              options={feeTypeOptions}
              value={feeTypeFilter}
              onChange={(v) => setFeeTypeFilter(v ?? "all")}
              placeholder="Pilih Jenis Tagihan"
            />
          </FormField>
        </div>
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={handleApply}>
            Terapkan Filter
          </Button>
        </div>
      </Card>

      {loading ? (
        <Card className="mt-6">
          <div className="py-10 text-center text-sm text-slate-500">Memuat data...</div>
        </Card>
      ) : error || !data ? (
        <Card className="mt-6">
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">
              {error?.message ?? "Gagal memuat laporan keuangan."}
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setLoading(true);
                setError(null);
                setQuery((prev) => ({ ...prev }));
              }}
            >
              Muat Ulang
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-surface-container-lowest p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
              <p className="text-sm font-medium text-on-surface-variant">Total Ditagih</p>
              <p className="mt-3 font-display text-2xl font-bold tracking-tight text-on-surface">
                {formatCurrency(data.totals.total_billed)}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-surface-container-lowest p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
              <p className="text-sm font-medium text-on-surface-variant">Total Dibayar</p>
              <p className="mt-3 font-display text-2xl font-bold tracking-tight text-on-surface">
                {formatCurrency(data.totals.total_paid)}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-surface-container-lowest p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
              <p className="text-sm font-medium text-on-surface-variant">
                Total Belum Dibayar
              </p>
              <p className="mt-3 font-display text-2xl font-bold tracking-tight text-on-surface">
                {formatCurrency(data.totals.total_outstanding)}
              </p>
            </div>
          </div>

          <Card className="mt-6">
            <h3 className="mb-4 font-display text-base font-semibold text-on-surface">
              Per Jenis Tagihan
            </h3>
            <DataTable
              columns={feeTypeColumns}
              data={data.per_fee_type}
              emptyMessage="Belum ada data per jenis tagihan."
            />
          </Card>

          <Card className="mt-6">
            <h3 className="mb-4 font-display text-base font-semibold text-on-surface">
              Tren Pembayaran Bulanan
            </h3>
            <DataTable
              columns={trendColumns}
              data={data.monthly_trend}
              emptyMessage="Belum ada data tren pembayaran."
            />
          </Card>
        </>
      )}
    </PageContainer>
  );
}