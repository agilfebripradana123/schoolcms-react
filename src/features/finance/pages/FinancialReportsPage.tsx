import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import AppSelect from "@/components/ui/Select";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ApiError } from "@/types";
import { financialReportService } from "../api/financial-report.service";
import type { FinancialReport, FinancialReportType } from "../api/types";
import FinancialReportForm from "../components/financial-report/FinancialReportForm";
import FinancialReportDeleteDialog from "../components/financial-report/FinancialReportDeleteDialog";

const PER_PAGE = 10;

const TYPE_LABELS: Record<FinancialReportType, string> = {
  harian: "Harian",
  bulanan: "Bulanan",
  semester: "Semester",
  tahunan: "Tahunan",
  custom: "Kustom",
};

const TYPE_VARIANTS: Record<FinancialReportType, "primary" | "secondary" | "warning" | "success" | "neutral"> = {
  harian: "primary",
  bulanan: "success",
  semester: "warning",
  tahunan: "neutral",
  custom: "secondary",
};

const TYPE_OPTIONS: Array<{ value: FinancialReportType; label: string }> = [
  { value: "harian", label: "Harian" },
  { value: "bulanan", label: "Bulanan" },
  { value: "semester", label: "Semester" },
  { value: "tahunan", label: "Tahunan" },
  { value: "custom", label: "Kustom" },
];

type TypeFilter = "all" | FinancialReportType;

interface QueryState {
  report_type: FinancialReportType | undefined;
  page: number;
}

export default function FinancialReportsPage() {
  const [data, setData] = useState<FinancialReport[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const [query, setQuery] = useState<QueryState>({
    report_type: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialReport | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<FinancialReport | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    financialReportService
      .list({
        report_type: query.report_type,
        page: query.page,
        per_page: PER_PAGE,
      })
      .then((res) => {
        if (!active) return;
        setData(res.data);
        setMeta(res.meta);
      })
      .catch((err) => {
        if (!active) return;
        setError(toApiError(err));
        setData([]);
        toast.error("Gagal memuat data laporan keuangan", {
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

  const handleTypeChange = useCallback((value: TypeFilter) => {
    setTypeFilter(value);
    setQuery((prev) => ({
      ...prev,
      report_type: value === "all" ? undefined : value,
      page: 1,
    }));
  }, []);

  const goToPage = useCallback((target: number) => {
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const handleSaved = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
    setQuery((prev) => ({ ...prev }));
  }, []);

  const handleDeleted = useCallback(() => {
    setDeleteOpen(false);
    setToDelete(null);
    setQuery((prev) => ({ ...prev }));
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: FinancialReport) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: FinancialReport) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const periodLabel = useCallback((row: FinancialReport) => {
    if (row.period_start && row.period_end) {
      return `${formatDate(row.period_start)} - ${formatDate(row.period_end)}`;
    }
    if (row.period_start) return formatDate(row.period_start);
    if (row.period_end) return formatDate(row.period_end);
    return "-";
  }, []);

  const columns = useMemo(() => {
    type Row = FinancialReport;
    return [
      {
        header: "Judul",
        accessor: "title" as keyof Row,
        className: "px-6 py-4 text-sm font-medium text-on-surface",
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="line-clamp-2">{row.title}</span>
        ),
      },
      {
        header: "Jenis",
        accessor: "report_type" as keyof Row,
        className: "px-6 py-4 text-sm whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <Badge variant={TYPE_VARIANTS[row.report_type] ?? "secondary"}>
            {TYPE_LABELS[row.report_type] ?? row.report_type ?? "-"}
          </Badge>
        ),
      },
      {
        header: "Periode",
        accessor: "period_start" as keyof Row,
        className: "px-6 py-4 text-sm text-slate-700 whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>{periodLabel(row)}</span>
        ),
      },
      {
        header: "Total Tagihan",
        accessor: "total_billed" as keyof Row,
        headerClassName: "px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-right text-sm text-slate-700 whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>
            {row.total_billed != null ? formatCurrency(row.total_billed) : "-"}
          </span>
        ),
      },
      {
        header: "Total Dibayar",
        accessor: "total_paid" as keyof Row,
        headerClassName: "px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-right text-sm text-tertiary font-semibold whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>
            {row.total_paid != null ? formatCurrency(row.total_paid) : "-"}
          </span>
        ),
      },
      {
        header: "Total Tertunggak",
        accessor: "total_outstanding" as keyof Row,
        headerClassName: "px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-right text-sm text-error font-semibold whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>
            {row.total_outstanding != null ? formatCurrency(row.total_outstanding) : "-"}
          </span>
        ),
      },
      {
        header: "Aksi",
        accessor: "id" as keyof Row,
        headerClassName: "px-4 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider",
        className: "px-4 py-4 text-center text-sm",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label={`Edit ${row.title}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label={`Hapus ${row.title}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [periodLabel, openEdit, openDelete]);

  const isFirstPage = meta.current_page <= 1;
  const isLastPage = meta.current_page >= meta.last_page;
  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  const typeFilterOptions = useMemo(
    () => [{ value: "all", label: "Semua Jenis" }, ...TYPE_OPTIONS],
    [],
  );

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Laporan Keuangan"
        description="Kelola laporan keuangan sekolah."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
            <span className="whitespace-nowrap">Jenis Laporan</span>
            <AppSelect
              options={typeFilterOptions}
              value={typeFilter}
              onChange={(v) => handleTypeChange((v ?? "all") as TypeFilter)}
              placeholder="Pilih Jenis"
              isSearchable={false}
            />
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data laporan keuangan.</p>
            <Button
              variant="secondary"
              onClick={() => setQuery((prev) => ({ ...prev }))}
            >
              Muat Ulang
            </Button>
          </div>
        ) : (
          <>
            {/* Kartu untuk mobile */}
            <div className="space-y-3 sm:hidden">
              {loading ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Memuat data...
                </div>
              ) : data.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Belum ada data laporan keuangan.
                </div>
              ) : (
                data.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-on-surface">{row.title}</p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {periodLabel(row)}
                        </p>
                        <div className="mt-2 space-y-0.5 text-xs text-on-surface-variant">
                          <p>
                            Total Tagihan:{" "}
                            <span className="font-semibold text-on-surface">
                              {row.total_billed != null ? formatCurrency(row.total_billed) : "-"}
                            </span>
                          </p>
                          <p>
                            Total Dibayar:{" "}
                            <span className="font-semibold text-tertiary">
                              {row.total_paid != null ? formatCurrency(row.total_paid) : "-"}
                            </span>
                          </p>
                          <p>
                            Total Tertunggak:{" "}
                            <span className="font-semibold text-error">
                              {row.total_outstanding != null
                                ? formatCurrency(row.total_outstanding)
                                : "-"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={TYPE_VARIANTS[row.report_type] ?? "secondary"}
                        className="shrink-0 px-2.5 py-1 text-xs leading-4"
                      >
                        {TYPE_LABELS[row.report_type] ?? row.report_type ?? "-"}
                      </Badge>
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => openDelete(row)}
                      >
                        <Trash2 className="h-4 w-4" /> Hapus
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="hidden sm:block">
              <DataTable
                columns={columns}
                data={data}
                loading={loading}
                emptyMessage="Belum ada data laporan keuangan."
              />
            </div>
          </>
        )}

        {!error && !loading && meta.total > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-on-surface-variant">
              Menampilkan {from}-{to} dari {meta.total} data
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={isFirstPage}
                onClick={() => goToPage(meta.current_page - 1)}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-on-surface-variant">
                Halaman {meta.current_page} dari {meta.last_page}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={isLastPage}
                onClick={() => goToPage(meta.current_page + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      <FinancialReportForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <FinancialReportDeleteDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setToDelete(null);
        }}
        onDeleted={handleDeleted}
        data={toDelete}
      />
    </PageContainer>
  );
}