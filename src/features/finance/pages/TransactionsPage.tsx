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
import { paymentTransactionService } from "../api/payment-transaction.service";
import type {
  PaymentTransaction,
  TransactionStatus,
  TransactionType,
} from "../api/types";
import TransactionForm from "../components/transaction/TransactionForm";
import TransactionDeleteDialog from "../components/transaction/TransactionDeleteDialog";

const PER_PAGE = 10;

const TYPE_LABELS: Record<TransactionType, string> = {
  payment: "Pembayaran",
  refund: "Pengembalian",
  adjustment: "Penyesuaian",
};

const TYPE_VARIANTS: Record<TransactionType, "success" | "danger" | "warning"> = {
  payment: "success",
  refund: "danger",
  adjustment: "warning",
};

const STATUS_LABELS: Record<TransactionStatus, string> = {
  success: "Berhasil",
  pending: "Menunggu",
  failed: "Gagal",
};

const STATUS_VARIANTS: Record<TransactionStatus, "success" | "warning" | "danger"> = {
  success: "success",
  pending: "warning",
  failed: "danger",
};

const TYPE_OPTIONS: Array<{ value: TransactionType; label: string }> = [
  { value: "payment", label: "Pembayaran" },
  { value: "refund", label: "Pengembalian" },
  { value: "adjustment", label: "Penyesuaian" },
];

const STATUS_OPTIONS: Array<{ value: TransactionStatus; label: string }> = [
  { value: "success", label: "Berhasil" },
  { value: "pending", label: "Menunggu" },
  { value: "failed", label: "Gagal" },
];

type TypeFilter = "all" | TransactionType;
type StatusFilter = "all" | TransactionStatus;

interface QueryState {
  type: TransactionType | undefined;
  status: TransactionStatus | undefined;
  page: number;
}

function formatTransactionDate(value?: string): string {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value.substring(0, 10) : formatDate(value);
}

export default function TransactionsPage() {
  const [data, setData] = useState<PaymentTransaction[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [query, setQuery] = useState<QueryState>({
    type: undefined,
    status: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentTransaction | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<PaymentTransaction | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    paymentTransactionService
      .list({
        type: query.type,
        status: query.status,
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
        toast.error("Gagal memuat data transaksi", {
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
      type: value === "all" ? undefined : value,
      page: 1,
    }));
  }, []);

  const handleStatusChange = useCallback((value: StatusFilter) => {
    setStatusFilter(value);
    setQuery((prev) => ({
      ...prev,
      status: value === "all" ? undefined : value,
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

  const openEdit = useCallback((row: PaymentTransaction) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: PaymentTransaction) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const paymentStudent = useCallback(
    (row: PaymentTransaction) => row.payment?.student?.name ?? `#${row.payment_id}`,
    [],
  );

  const columns = useMemo(() => {
    type Row = PaymentTransaction;
    return [
      {
        header: "Kode Transaksi",
        accessor: "transaction_code" as keyof Row,
        className: "px-6 py-4 text-sm font-medium text-on-surface whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>{row.transaction_code || "-"}</span>
        ),
      },
      {
        header: "Siswa",
        accessor: "payment_id" as keyof Row,
        className: "px-6 py-4 text-sm text-slate-700 whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>{paymentStudent(row)}</span>
        ),
      },
      {
        header: "Tipe",
        accessor: "type" as keyof Row,
        headerClassName: "px-6 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-sm whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex justify-center">
            <Badge variant={TYPE_VARIANTS[row.type] ?? "secondary"}>
              {TYPE_LABELS[row.type] ?? row.type ?? "-"}
            </Badge>
          </div>
        ),
      },
      {
        header: "Jumlah",
        accessor: "amount" as keyof Row,
        headerClassName: "px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-right text-sm font-semibold whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <span
            className={
              row.type === "refund"
                ? "text-error"
                : row.type === "payment"
                  ? "text-tertiary"
                  : "text-on-surface"
            }
          >
            {row.amount != null
              ? `${row.type === "refund" ? "\u2212" : row.type === "payment" ? "+" : ""}${formatCurrency(row.amount)}`
              : "-"}
          </span>
        ),
      },
      
      {
        header: "Metode",
        accessor: "method" as keyof Row,
        headerClassName:
          "px-6 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-sm whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => {
          const labels = {
            cash: "Tunai",
            transfer: "Transfer",
            qris: "QRIS",
            lainnya: "Lainnya",
          } as const;

          const variants = {
            cash: "success",
            transfer: "primary",
            qris: "secondary",
            lainnya: "warning",
          } as const;

          return (
            <div className="flex justify-center">
              <Badge variant={row.method ? variants[row.method] : "neutral"}>
                {row.method ? (labels[row.method] ?? row.method) : "-"}
              </Badge>
            </div>
          );
        },
      },
      {
        header: "Tanggal",
        accessor: "transaction_date" as keyof Row,
        className: "px-6 py-4 text-sm text-slate-700 whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>{formatTransactionDate(row.transaction_date)}</span>
        ),
      },
      {
        header: "Status",
        accessor: "status" as keyof Row,
        headerClassName: "px-6 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-sm whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex justify-center">
            <Badge variant={STATUS_VARIANTS[row.status] ?? "secondary"}>
              {STATUS_LABELS[row.status] ?? row.status ?? "-"}
            </Badge>
          </div>
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
              aria-label={`Edit ${row.transaction_code}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label={`Hapus ${row.transaction_code}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [paymentStudent, openEdit, openDelete]);

  const isFirstPage = meta.current_page <= 1;
  const isLastPage = meta.current_page >= meta.last_page;
  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  const typeFilterOptions = useMemo(
    () => [{ value: "all", label: "Semua Tipe" }, ...TYPE_OPTIONS],
    [],
  );
  const statusFilterOptions = useMemo(
    () => [{ value: "all", label: "Semua Status" }, ...STATUS_OPTIONS],
    [],
  );

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Transaksi"
        description="Kelola transaksi pembayaran, pengembalian, dan penyesuaian."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center *:md:gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
            <span className="whitespace-nowrap">Tipe</span>
            <AppSelect
              options={typeFilterOptions}
              value={typeFilter}
              onChange={(v) => handleTypeChange((v ?? "all") as TypeFilter)}
              placeholder="Pilih Tipe"
              isSearchable={false}
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
            <span className="whitespace-nowrap">Status</span>
            <AppSelect
              options={statusFilterOptions}
              value={statusFilter}
              onChange={(v) => handleStatusChange((v ?? "all") as StatusFilter)}
              placeholder="Pilih Status"
              isSearchable={false}
            />
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data transaksi.</p>
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
                  Belum ada data transaksi.
                </div>
              ) : (
                data.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-on-surface">
                          {row.transaction_code || "-"}
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {paymentStudent(row)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {formatTransactionDate(row.transaction_date)}
                        </p>
                        <p
                          className={`mt-1 font-semibold ${
                            row.type === "refund"
                              ? "text-error"
                              : row.type === "payment"
                                ? "text-tertiary"
                                : "text-on-surface"
                          }`}
                        >
                          {row.amount != null
                            ? `${row.type === "refund" ? "−" : row.type === "payment" ? "+" : ""}${formatCurrency(row.amount)}`
                            : "-"}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge variant={TYPE_VARIANTS[row.type] ?? "secondary"}>
                          {TYPE_LABELS[row.type] ?? row.type ?? "-"}
                        </Badge>
                        <Badge variant={STATUS_VARIANTS[row.status] ?? "secondary"}>
                          {STATUS_LABELS[row.status] ?? row.status ?? "-"}
                        </Badge>
                      </div>
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
                emptyMessage="Belum ada data transaksi."
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

      <TransactionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <TransactionDeleteDialog
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