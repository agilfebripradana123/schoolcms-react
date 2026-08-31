import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Plus, Pencil, Trash2 } from "lucide-react";
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
import { billingService } from "../api/billing.service";
import { feeTypeService } from "../api/fee-type.service";
import { academicYearService } from "@/features/academic/api/academic-year.service";
import { semesterService } from "@/features/academic/api/semester.service";
import { studentService } from "@/features/students/api/student.service";
import type {
  AcademicYear,
  Billing,
  BillingStatus,
  FeeType,
  Semester,
} from "../api/types";
import type { Student } from "@/features/students/api/types";
import BillingForm from "../components/billing/BillingForm";
import BillingDeleteDialog from "../components/billing/BillingDeleteDialog";
import BillingDetail from "../components/billing/BillingDetail";

const PER_PAGE = 10;

const STATUS_LABELS: Record<BillingStatus, string> = {
  unpaid: "Belum Bayar",
  partial: "Sebagian",
  paid: "Lunas",
  cancelled: "Dibatalkan",
};

const STATUS_VARIANTS: Record<BillingStatus, "danger" | "warning" | "success" | "secondary"> = {
  unpaid: "danger",
  partial: "warning",
  paid: "success",
  cancelled: "secondary",
};

const STATUS_OPTIONS: Array<{ value: BillingStatus; label: string }> = [
  { value: "unpaid", label: "Belum Bayar" },
  { value: "partial", label: "Sebagian" },
  { value: "paid", label: "Lunas" },
  { value: "cancelled", label: "Dibatalkan" },
];

type StatusFilter = "all" | BillingStatus;

interface QueryState {
  student_id: number | undefined;
  fee_type_id: number | undefined;
  academic_year_id: number | undefined;
  semester_id: number | undefined;
  status: BillingStatus | undefined;
  page: number;
}

export default function BillingsPage() {
  const [data, setData] = useState<Billing[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [feeTypeFilter, setFeeTypeFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [query, setQuery] = useState<QueryState>({
    student_id: undefined,
    fee_type_id: undefined,
    academic_year_id: undefined,
    semester_id: undefined,
    status: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Billing | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Billing | null>(null);
  const [detail, setDetail] = useState<Billing | null>(null);

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
    academicYearService
      .list({ per_page: 100 })
      .then((res) => setYears(res.data))
      .catch(() => {
        toast.error("Gagal memuat data tahun ajaran");
      });
    semesterService
      .list({ per_page: 100 })
      .then((res) => setSemesters(res.data))
      .catch(() => {
        toast.error("Gagal memuat data semester");
      });
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    billingService
      .list({
        student_id: query.student_id,
        fee_type_id: query.fee_type_id,
        academic_year_id: query.academic_year_id,
        semester_id: query.semester_id,
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
        toast.error("Gagal memuat data penagihan", {
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

  const setFilter = useCallback((key: string, value: string) => {
    setQuery((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : Number(value),
      page: 1,
    }));
  }, []);

  const handleStudentChange = useCallback((value: string) => {
    setStudentFilter(value);
    setFilter("student_id", value);
  }, [setFilter]);

  const handleFeeTypeChange = useCallback((value: string) => {
    setFeeTypeFilter(value);
    setFilter("fee_type_id", value);
  }, [setFilter]);

  const handleYearChange = useCallback((value: string) => {
    setYearFilter(value);
    setFilter("academic_year_id", value);
  }, [setFilter]);

  const handleSemesterChange = useCallback((value: string) => {
    setSemesterFilter(value);
    setFilter("semester_id", value);
  }, [setFilter]);

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

  const openDetail = useCallback((row: Billing) => {
    setDetail(row);
  }, []);

  const openEdit = useCallback((row: Billing) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Billing) => {
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

  const yearMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const y of years) map[y.id] = y.name;
    return map;
  }, [years]);

  const semesterMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const s of semesters) map[s.id] = `Semester ${s.name}`;
    return map;
  }, [semesters]);

  const studentName = useCallback(
    (row: Billing) =>
      row.student?.name ??
      (row.student_id != null ? studentMap[row.student_id] ?? `#${row.student_id}` : "-"),
    [studentMap],
  );
  const feeTypeName = useCallback(
    (row: Billing) =>
      row.fee_type?.name ??
      (row.fee_type_id != null ? feeTypeMap[row.fee_type_id] ?? `#${row.fee_type_id}` : "-"),
    [feeTypeMap],
  );
  const yearName = useCallback(
    (row: Billing) =>
      row.academic_year?.name ??
      (row.academic_year_id != null ? yearMap[row.academic_year_id] ?? `#${row.academic_year_id}` : "-"),
    [yearMap],
  );
  const semesterName = useCallback(
    (row: Billing) =>
      row.semester
        ? `Semester ${row.semester.name}`
        : row.semester_id != null
          ? semesterMap[row.semester_id] ?? `#${row.semester_id}`
          : "-",
    [semesterMap],
  );

  const columns = useMemo(() => {
    type Row = Billing;
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
        accessor: "fee_type_id" as keyof Row,
        className: "px-6 py-4 text-sm text-slate-700 whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>{feeTypeName(row)}</span>
        ),
      },
      {
        header: "Tahun Ajaran",
        accessor: "academic_year_id" as keyof Row,
        className: "px-6 py-4 text-sm text-slate-700 whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>{yearName(row)}</span>
        ),
      },
      {
        header: "Semester",
        accessor: "semester_id" as keyof Row,
        className: "px-6 py-4 text-sm text-slate-700 whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>{semesterName(row)}</span>
        ),
      },
      {
        header: "Jumlah",
        accessor: "amount" as keyof Row,
        headerClassName: "px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-left text-sm text-on-surface font-semibold whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>
            {row.amount != null ? formatCurrency(row.amount) : "-"}
          </span>
        ),
      },
      {
        header: "Jatuh Tempo",
        accessor: "due_date" as keyof Row,
        className: "px-6 py-4 text-sm text-slate-700 whitespace-nowrap",
        render: (_value: Row[keyof Row], row: Row) => (
          <span>
            {row.due_date ? formatDate(row.due_date) : "-"}
          </span>
        ),
      },
      {
        header: "Status",
        accessor: "status" as keyof Row,
        headerClassName:"px-4 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider",
        className: "px-4 py-4 text-center",
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
              onClick={() => openDetail(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label="Lihat detail tagihan"
            >
              <Eye className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label="Edit penagihan"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus penagihan"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [studentName, feeTypeName, yearName, semesterName, openDetail, openEdit, openDelete]);

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
  const feeTypeFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Jenis Tagihan" },
      ...feeTypes.map((f) => ({ value: String(f.id), label: f.name })),
    ],
    [feeTypes],
  );
  const yearFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Tahun Ajaran" },
      ...years.map((y) => ({ value: String(y.id), label: y.name })),
    ],
    [years],
  );
  const semesterFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Semester" },
      ...semesters.map((s) => ({ value: String(s.id), label: `Semester ${s.name}` })),
    ],
    [semesters],
  );
  const statusFilterOptions = useMemo(
    () => [{ value: "all", label: "Semua Status" }, ...STATUS_OPTIONS],
    [],
  );

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Penagihan"
        description="Kelola tagihan yang ditagihkan kepada siswa."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 *:md:gap-4 lg:grid-cols-3">
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
            <span className="whitespace-nowrap">Jenis Tagihan</span>
            <AppSelect
              options={feeTypeFilterOptions}
              value={feeTypeFilter}
              onChange={(v) => handleFeeTypeChange(v ?? "all")}
              placeholder="Pilih Jenis Tagihan"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
            <span className="whitespace-nowrap">Semester</span>
            <AppSelect
              options={semesterFilterOptions}
              value={semesterFilter}
              onChange={(v) => handleSemesterChange(v ?? "all")}
              placeholder="Pilih Semester"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface-variant md:min-w-[160px] md:flex-1">
            <span className="whitespace-nowrap">Tahun Ajaran</span>
            <AppSelect
              options={yearFilterOptions}
              value={yearFilter}
              onChange={(v) => handleYearChange(v ?? "all")}
              placeholder="Pilih Tahun Ajaran"
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
            <p className="text-sm text-error">Gagal memuat data penagihan.</p>
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
                  Belum ada data penagihan.
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
                          {feeTypeName(row)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {yearName(row)} · {semesterName(row)}
                        </p>
                        <p className="mt-1 font-semibold text-on-surface">
                          {row.amount != null ? formatCurrency(row.amount) : "-"}
                        </p>
                        {row.due_date && (
                          <p className="text-xs text-on-surface-variant">
                            Jatuh tempo: {formatDate(row.due_date)}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={STATUS_VARIANTS[row.status] ?? "secondary"}
                        className="shrink-0 px-2.5 py-1 text-xs leading-4"
                      >
                        {STATUS_LABELS[row.status] ?? row.status ?? "-"}
                      </Badge>
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openDetail(row)}
                      >
                        <Eye className="h-4 w-4" /> Detail
                      </Button>
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
                emptyMessage="Belum ada data penagihan."
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

      <BillingForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <BillingDetail
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        billingId={detail?.id ?? null}
      />

      <BillingDeleteDialog
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