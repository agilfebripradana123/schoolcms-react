import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import AppSelect from "@/components/ui/Select";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Pagination from "@/components/ui/Pagination";
import { toApiError } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { ApiError } from "@/types";
import { outgoingLetterService } from "../api/outgoing-letter.service";
import type {
  LetterCategory,
  OutgoingLetter,
  OutgoingLetterStatus,
} from "../api/types";
import OutgoingLetterForm from "../components/outgoing-letter/OutgoingLetterForm";
import OutgoingLetterDeleteDialog from "../components/outgoing-letter/OutgoingLetterDeleteDialog";

const PER_PAGE = 10;

const CATEGORY_LABELS: Record<LetterCategory, string> = {
  undangan: "Undangan",
  permohonan: "Permohonan",
  pemberitahuan: "Pemberitahuan",
  lainnya: "Lainnya",
};

const CATEGORY_VARIANTS: Record<
  LetterCategory,
  "primary" | "secondary" | "warning" | "neutral"
> = {
  undangan: "primary",
  permohonan: "warning",
  pemberitahuan: "neutral",
  lainnya: "secondary",
};

const STATUS_LABELS: Record<OutgoingLetterStatus, string> = {
  draft: "Draft",
  terkirim: "Terkirim",
  diarsipkan: "Diarsipkan",
};

const STATUS_VARIANTS: Record<
  OutgoingLetterStatus,
  "success" | "warning" | "neutral"
> = {
  draft: "warning",
  terkirim: "success",
  diarsipkan: "neutral",
};

const CATEGORY_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "Semua Kategori" },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

const STATUS_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "Semua Status" },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

interface QueryState {
  q: string | undefined;
  category: string | undefined;
  status: string | undefined;
  page: number;
}

export default function OutgoingLettersPage() {
  const [data, setData] = useState<OutgoingLetter[]>([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: PER_PAGE,
    total: 0,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [query, setQuery] = useState<QueryState>({
    q: undefined,
    category: undefined,
    status: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<OutgoingLetter | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<OutgoingLetter | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      setQuery((prev) => ({ ...prev, q: searchInput || undefined, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;

    outgoingLetterService
      .list({
        q: query.q,
        category: query.category,
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
        toast.error("Gagal memuat data surat keluar", {
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

  const goToPage = useCallback((target: number) => {
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategoryFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      category: value === "all" ? undefined : value,
      page: 1,
    }));
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      status: value === "all" ? undefined : value,
      page: 1,
    }));
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

  const openEdit = useCallback((row: OutgoingLetter) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: OutgoingLetter) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = OutgoingLetter;
    return [
      {
        header: "Nomor Surat",
        accessor: "letter_number" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="whitespace-nowrap text-sm font-medium text-on-surface">
            {row.letter_number}
          </span>
        ),
      },
      {
        header: "Tujuan",
        accessor: "recipient" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="whitespace-nowrap text-sm text-slate-700">
            {row.recipient}
          </span>
        ),
      },
      {
        header: "Perihal",
        accessor: "subject" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="min-w-0">
            <p className="truncate text-sm text-slate-700">{row.subject}</p>
            {row.notes && (
              <p className="truncate text-xs text-on-surface-variant">{row.notes}</p>
            )}
          </div>
        ),
      },
      {
        header: "Tanggal Surat",
        accessor: "letter_date" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="whitespace-nowrap text-sm text-slate-700">
            {row.letter_date ? formatDate(row.letter_date) : "-"}
          </span>
        ),
      },
      {
        header: "Kategori",
        accessor: "category" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex justify-center">
            <Badge variant={CATEGORY_VARIANTS[row.category] ?? "secondary"}>
              {CATEGORY_LABELS[row.category] ?? row.category ?? "-"}
            </Badge>
          </div>
        ),
      },
      {
        header: "Status",
        accessor: "status" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex justify-center">
            <Badge variant={STATUS_VARIANTS[row.status] ?? "neutral"}>
              {STATUS_LABELS[row.status] ?? row.status ?? "-"}
            </Badge>
          </div>
        ),
      },
      {
        header: "Aksi",
        accessor: "id" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label={`Edit surat ${row.letter_number}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label={`Hapus surat ${row.letter_number}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [openEdit, openDelete]);


  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Surat Keluar"
        description="Kelola pencatatan dan status surat keluar."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end *:md:gap-3">
          <div className="flex flex-1 flex-col gap-1 md:min-w-[200px] md:flex-1">
            <Search
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Cari nomor / tujuan / perihal..."
            />
          </div>

          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:min-w-[170px] md:flex-1">
            <span className="whitespace-nowrap">Kategori</span>
            <AppSelect
              options={CATEGORY_FILTER_OPTIONS}
              value={categoryFilter}
              onChange={(v) => handleCategoryChange(v ?? "all")}
              placeholder="Pilih Kategori"
            />
          </label>

          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:min-w-[170px] md:flex-1">
            <span className="whitespace-nowrap">Status</span>
            <AppSelect
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(v) => handleStatusChange(v ?? "all")}
              placeholder="Pilih Status"
            />
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data surat keluar.</p>
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
            <div className="space-y-3 sm:hidden">
              {loading ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Memuat data...
                </div>
              ) : data.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Belum ada surat keluar.
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
                          {row.letter_number}
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {row.recipient}
                        </p>
                        <p className="truncate text-xs text-on-surface-variant">
                          {row.subject}
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {row.letter_date ? formatDate(row.letter_date) : "-"}
                        </p>
                      </div>
                      <Badge variant={STATUS_VARIANTS[row.status] ?? "neutral"} className="shrink-0">
                        {STATUS_LABELS[row.status] ?? row.status ?? "-"}
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
                emptyMessage="Belum ada surat keluar."
              />
            </div>
          </>
        )}

        <Pagination meta={meta} onPageChange={goToPage} loading={loading} error={error} />
      </Card>

      <OutgoingLetterForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <OutgoingLetterDeleteDialog
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