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
import { paymentService } from "../api/payment.service";
import { feeTypeService } from "../api/fee-type.service";
import { studentService } from "@/features/students/api/student.service";
import type { FeeType, Payment, PaymentMethod } from "../api/types";
import type { Student } from "@/features/students/api/types";
import PaymentForm from "../components/payment/PaymentForm";
import PaymentDeleteDialog from "../components/payment/PaymentDeleteDialog";

const PER_PAGE = 10;

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Tunai",
  transfer: "Transfer",
  qris: "QRIS",
  lainnya: "Lainnya",
};

const METHOD_VARIANTS: Record<PaymentMethod, "primary" | "secondary" | "warning" | "neutral"> = {
  cash: "secondary",
  transfer: "primary",
  qris: "warning",
  lainnya: "neutral",
};

const METHOD_OPTIONS: Array<{ value: PaymentMethod; label: string }> = [
  { value: "cash", label: "Tunai" },
  { value: "transfer", label: "Transfer" },
  { value: "qris", label: "QRIS" },
  { value: "lainnya", label: "Lainnya" },
];

type MethodFilter = "all" | PaymentMethod;

interface QueryState {
  student_id: number | undefined;
  method: PaymentMethod | undefined;
  page: number;
}

export default function PaymentsPage() {
  const [data, setData] = useState<Payment[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);

  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("all");

  const [query, setQuery] = useState<QueryState>({
    student_id: undefined,
    method: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Payment | null>(null);

  useEffect(() => {
    studentService
      .list({ per_page: 200 })
      .then((res) => setStudents(res.data))
      .catch(() => {
        toast.error("Gagal memuat data siswa");
      });
    feeTypeService
      .list({ per_page: 100 })
      .then((res) => setFeeTypes(res.data))
      .catch(() => {
        toast.error("Gagal memuat data jenis tagihan");
      });
  }, []);

  useEffect(() => {
    let active = true;

    paymentService
      .list({
        student_id: query.student_id,
        method: query.method,
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
        toast.error("Gagal memuat data pembayaran", {
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

  const handleStudentChange = useCallback((value: string) => {
    setStudentFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      student_id: value === "all" ? undefined : Number(value),
      page: 1,
    }));
  }, []);

  const handleMethodChange = useCallback((value: MethodFilter) => {
    setMethodFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      method: value === "all" ? undefined : value,
      page: 1,
    }));
  }, []);

  const goToPage = useCallback((target: number) => {
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const handleSaved = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev }));
  }, []);

  const handleDeleted = useCallback(() => {
    setDeleteOpen(false);
    setToDelete(null);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev }));
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: Payment) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Payment) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const studentMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const s of students) map[s.id] = s.name;
    return map;
  }, [students]);

  const feeTypeMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const f of feeTypes) map[f.id] = f.name;
    return map;
  }, [feeTypes]);

  const studentName = useCallback(
    (row: Payment) =>
      row.student?.name ??
      (row.student_id != null ? studentMap[row.student_id] ?? `#${row.student_id}` : "-"),
    [studentMap],
  );
  const billingFeeType = useCallback(
    (row: Payment) => {
      const feeTypeId = row.billing?.fee_type_id;
      return feeTypeId != null
        ? feeTypeMap[feeTypeId] ?? `#${feeTypeId}`
        : row.billing_id != null
          ? `Tagihan #${row.billing_id}`
          : "-";
    },
    [feeTypeMap],
  );
  const cashierName = useCallback(
    (row: Payment) =>
      row.cashier?.name ?? (row.received_by != null ? `#${row.received_by}` : "-"),
    [],
  );

  const columns = useMemo(() => {
    type Row = Payment;
    return [
      {
        header: "Siswa",
        accessor: "student_id" as keyof Row,
        className: "px-6 py-4 text-sm font-medium text-on-surface",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>{studentName(row)}</span>
        ),
      },
      {
        header: "Jenis Tagihan",
        accessor: "billing_id" as keyof Row,
        className: "px-6 py-4 text-sm text-slate-700 whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>{billingFeeType(row)}</span>
        ),
      },
      {
        header: "Tanggal Bayar",
        accessor: "payment_date" as keyof Row,
        className: "px-6 py-4 text-sm text-slate-700 whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>
            {row.payment_date ? formatDate(row.payment_date) : "-"}
          </span>
        ),
      },
      {
        header: "Jumlah",
        accessor: "amount" as keyof Row,
        headerClassName: "px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-right text-sm text-on-surface font-semibold whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>
            {row.amount != null ? formatCurrency(row.amount) : "-"}
          </span>
        ),
      },
      {
        header: "Metode",
        accessor: "method" as keyof Row,
        headerClassName: "px-6 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-sm text-slate-700 whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex justify-center">
            <Badge variant={METHOD_VARIANTS[row.method] ?? "secondary"}>
              {METHOD_LABELS[row.method] ?? row.method ?? "-"}
            </Badge>
          </div>
        ),
      },
      {
        header: "Kasir",
        accessor: "received_by" as keyof Row,
        className: "px-6 py-4 text-sm text-slate-700 whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>{cashierName(row)}</span>
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
              aria-label="Edit pembayaran"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus pembayaran"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [studentName, billingFeeType, cashierName, openEdit, openDelete]);

  const isFirstPage = meta.current_page <= 1;
  const isLastPage = meta.current_page >= meta.last_page;
  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  const studentFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Siswa" },
      ...students.map((s) => ({ value: String(s.id), label: s.name })),
    ],
    [students],
  );
  const methodFilterOptions = useMemo(
    () => [{ value: "all", label: "Semua Metode" }, ...METHOD_OPTIONS],
    [],
  );

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Pembayaran"
        description="Kelola pencatatan pembayaran dari siswa."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center *:md:gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
            <span className="whitespace-nowrap">Siswa</span>
            <AppSelect
              options={studentFilterOptions}
              value={studentFilter}
              onChange={(v) => handleStudentChange(v ?? "all")}
              placeholder="Pilih Siswa"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
            <span className="whitespace-nowrap">Metode</span>
            <AppSelect
              options={methodFilterOptions}
              value={methodFilter}
              onChange={(v) => handleMethodChange((v ?? "all") as MethodFilter)}
              placeholder="Pilih Metode"
              isSearchable={false}
            />
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data pembayaran.</p>
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
                  Belum ada data pembayaran.
                </div>
              ) : (
                data.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-on-surface">
                          {studentName(row)}
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {billingFeeType(row)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {row.payment_date ? formatDate(row.payment_date) : "-"}
                        </p>
                        <p className="mt-1 font-semibold text-on-surface">
                          {row.amount != null ? formatCurrency(row.amount) : "-"}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Kasir: {cashierName(row)}
                        </p>
                      </div>
                      <Badge
                        variant={METHOD_VARIANTS[row.method] ?? "secondary"}
                        className="shrink-0 px-2.5 py-1 text-xs leading-4"
                      >
                        {METHOD_LABELS[row.method] ?? row.method ?? "-"}
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
                emptyMessage="Belum ada data pembayaran."
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

      <PaymentForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <PaymentDeleteDialog
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