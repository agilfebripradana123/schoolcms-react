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
import { formatDate } from "@/lib/utils";
import type { ApiError } from "@/types";
import { dispositionService } from "../api/disposition.service";
import { incomingLetterService } from "../api/incoming-letter.service";
import type {
  Disposition,
  DispositionStatus,
  IncomingLetter,
} from "../api/types";
import DispositionForm from "../components/disposition/DispositionForm";
import DispositionDeleteDialog from "../components/disposition/DispositionDeleteDialog";
import Pagination from "@/components/ui/Pagination";

const PER_PAGE = 10;

const STATUS_LABELS: Record<DispositionStatus, string> = {
  belum: "Belum",
  proses: "Proses",
  selesai: "Selesai",
};

const STATUS_VARIANTS: Record<
  DispositionStatus,
  "neutral" | "warning" | "success"
> = {
  belum: "neutral",
  proses: "warning",
  selesai: "success",
};

const STATUS_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "Semua Status" },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

interface QueryState {
  incoming_letter_id: number | undefined;
  status: string | undefined;
  page: number;
}

function letterLabel(l: IncomingLetter): string {
  return l.letter_number ? `${l.letter_number} — ${l.subject}` : `${l.subject} (#${l.id})`;
}

export default function DispositionsPage() {
  const [data, setData] = useState<Disposition[]>([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: PER_PAGE,
    total: 0,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [letters, setLetters] = useState<IncomingLetter[]>([]);
  const [lettersError, setLettersError] = useState(false);

  const [letterFilter, setLetterFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [query, setQuery] = useState<QueryState>({
    incoming_letter_id: undefined,
    status: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Disposition | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Disposition | null>(null);

  useEffect(() => {
    let active = true;

    incomingLetterService
      .list({ per_page: 200 })
      .then((res) => {
        if (!active) return;
        setLetters(res.data);
        setLettersError(false);
      })
      .catch(() => {
        if (!active) return;
        setLettersError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    dispositionService
      .list({
        incoming_letter_id: query.incoming_letter_id,
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
        toast.error("Gagal memuat data disposisi", {
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

  const handleLetterChange = useCallback((value: string) => {
    setLetterFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      incoming_letter_id: value === "all" ? undefined : Number(value),
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

  const openEdit = useCallback((row: Disposition) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Disposition) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const letterFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Surat Masuk" },
      ...letters.map((l) => ({ value: String(l.id), label: letterLabel(l) })),
    ],
    [letters],
  );

  const columns = useMemo(() => {
    type Row = Disposition;
    return [
      {
        header: "Surat Masuk",
        accessor: "incoming_letter_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="min-w-0">
            <p className="whitespace-nowrap text-sm font-medium text-on-surface">
              {row.incoming_letter?.letter_number ?? `#${row.incoming_letter_id}`}
            </p>
            <p className="truncate text-xs text-on-surface-variant">
              {row.incoming_letter?.subject ?? "-"}
            </p>
          </div>
        ),
      },
      {
        header: "Diteruskan Kepada",
        accessor: "assigned_to" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="whitespace-nowrap text-sm text-slate-700">
            {row.assigned_to}
          </span>
        ),
      },
      {
        header: "Instruksi",
        accessor: "instruction" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="min-w-0">
            <p className="truncate text-sm text-slate-700">
              {row.instruction ?? "-"}
            </p>
          </div>
        ),
      },
      {
        header: "Batas Waktu",
        accessor: "due_date" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="whitespace-nowrap text-sm text-slate-700">
            {row.due_date ? formatDate(row.due_date) : "-"}
          </span>
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
              aria-label="Edit disposisi"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus disposisi"
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
        title="Disposisi"
        description="Kelola penerusan dan tindak lanjut surat masuk."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end *:md:gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:min-w-[220px] md:flex-1">
            <span className="whitespace-nowrap">Surat Masuk</span>
            {lettersError ? (
              <AppSelect
                options={[{ value: "all", label: "Semua Surat Masuk" }]}
                value="all"
                onChange={(v) => handleLetterChange(v ?? "all")}
                placeholder="Gagal memuat surat masuk"
              />
            ) : (
              <AppSelect
                options={letterFilterOptions}
                value={letterFilter}
                onChange={(v) => handleLetterChange(v ?? "all")}
                placeholder="Pilih Surat Masuk"
              />
            )}
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
            <p className="text-sm text-error">Gagal memuat data disposisi.</p>
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
                  Belum ada disposisi.
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
                          {row.incoming_letter?.letter_number ??
                            `#${row.incoming_letter_id}`}
                        </p>
                        <p className="truncate text-xs text-on-surface-variant">
                          {row.incoming_letter?.subject ?? "-"}
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          Disposisi: {row.assigned_to}
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {row.due_date ? `Batas: ${formatDate(row.due_date)}` : "Tanpa batas waktu"}
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
                emptyMessage="Belum ada disposisi."
              />
            </div>
          </>
        )}

        <Pagination meta={meta} onPageChange={goToPage} loading={loading} error={error} />
      </Card>

      <DispositionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <DispositionDeleteDialog
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