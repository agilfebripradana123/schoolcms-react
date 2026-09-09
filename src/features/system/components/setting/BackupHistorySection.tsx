import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eye } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card, { CardHeader } from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { backupLogService } from "../../api/backup-log.service";
import type { BackupLog } from "../../api/types";
import ErrorState from "../ErrorState";

const PER_PAGE = 10;

interface QueryState {
  q: string;
  status: string;
  page: number;
}

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatFileSize(bytes?: number | null): string {
  if (bytes == null) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function statusVariant(status: string): "success" | "danger" | "warning" | "neutral" {
  const s = status.toLowerCase();
  if (s === "success" || s === "completed" || s === "done") return "success";
  if (s === "failed" || s === "error") return "danger";
  if (s === "running" || s === "pending" || s === "in_progress") return "warning";
  return "neutral";
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid grid-cols-3 gap-3 border-b border-outline-variant py-2 last:border-0">
      <dt className="text-sm text-on-surface-variant">{label}</dt>
      <dd className="col-span-2 break-words text-sm font-medium text-on-surface">
        {value ?? "-"}
      </dd>
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "success", label: "success" },
  { value: "failed", label: "failed" },
  { value: "running", label: "running" },
];

export default function BackupHistorySection() {
  const [data, setData] = useState<BackupLog[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState<QueryState>({ q: "", status: "", page: 1 });

  const [detail, setDetail] = useState<BackupLog | null>(null);

  const searchTimeout = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    backupLogService
      .list({
        q: query.q || undefined,
        status: query.status || undefined,
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
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    searchTimeout.current = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      setQuery((prev) => ({ ...prev, q: value, page: 1 }));
    }, 400);
  }, []);

  const handleStatusChange = useCallback((value: string | null) => {
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, status: value ?? "", page: 1 }));
  }, []);

  const goToPage = useCallback((target: number) => {
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev }));
  }, []);

  const openDetail = useCallback((row: BackupLog) => {
    setDetail(row);
  }, []);

  const columns = useMemo(() => {
    type Row = BackupLog;
    return [
      {
        header: "Waktu",
        accessor: "created_at" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="whitespace-nowrap text-on-surface">
            {formatDateTime(row.created_at ?? row.started_at)}
          </span>
        ),
      },
      {
        header: "Status",
        accessor: "status" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
        ),
      },
      {
        header: "Ukuran",
        accessor: "file_size" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-on-surface">{formatFileSize(row.file_size)}</span>
        ),
      },
      {
        header: "Tipe",
        accessor: "type" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-on-surface">{row.type ?? "-"}</span>
        ),
      },
      {
        header: "Deskripsi",
        accessor: "description" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="block max-w-xs truncate text-on-surface">{row.description ?? "-"}</span>
        ),
      },
      {
        header: "Aksi",
        accessor: "id" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-outline uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-on-surface",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openDetail(row)}
              className="rounded-lg p-2 text-outline transition-colors hover:bg-surface-container-low hover:text-primary-container"
              aria-label={`Detail backup ${row.id}`}
              title="Detail"
            >
              <Eye className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [openDetail]);

  return (
    <>
      <Card>
        <CardHeader
          title="Riwayat Backup"
          description="Daftar riwayat proses backup sistem (hanya baca)."
        />

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <Search
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari deskripsi backup..."
            />
          </div>
          <div className="w-full sm:w-48">
            <AppSelect
              options={STATUS_OPTIONS}
              value={query.status || ""}
              onChange={handleStatusChange}
              placeholder="Semua"
              isSearchable={false}
              isClearable={false}
            />
          </div>
        </div>

        {error ? (
          <ErrorState error={error} onRetry={retry} />
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 sm:hidden">
              {loading ? (
                <div className="py-10 text-center text-sm text-outline">Memuat data...</div>
              ) : data.length === 0 ? (
                <div className="py-10 text-center text-sm text-outline">
                  Tidak ada riwayat backup.
                </div>
              ) : (
                data.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-on-surface">{row.type ?? "-"}</p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {formatDateTime(row.created_at ?? row.started_at)}
                        </p>
                      </div>
                      <Badge variant={statusVariant(row.status)} className="shrink-0">
                        {row.status}
                      </Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">
                      {row.description ?? "-"}
                    </p>
                    <p className="mt-1 text-xs text-outline">
                      {formatFileSize(row.file_size)}
                    </p>
                    <div className="mt-3 flex gap-2 border-t border-outline-variant pt-3">
                      <Button variant="secondary" size="sm" onClick={() => openDetail(row)}>
                        <Eye className="h-4 w-4" /> Detail
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
                emptyMessage="Tidak ada riwayat backup."
              />
            </div>
          </>
        )}

        <Pagination meta={meta} onPageChange={goToPage} loading={loading} error={error} />
      </Card>

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Detail Riwayat Backup"
        size="md"
        footer={
          <Button variant="ghost" onClick={() => setDetail(null)}>
            Tutup
          </Button>
        }
      >
        {detail && (
          <dl>
            <DetailRow label="Status" value={detail.status} />
            <DetailRow label="File Path" value={detail.file_path} />
            <DetailRow label="Ukuran" value={formatFileSize(detail.file_size)} />
            <DetailRow label="Tipe" value={detail.type} />
            <DetailRow label="Deskripsi" value={detail.description} />
            <DetailRow label="Mulai" value={formatDateTime(detail.started_at)} />
            <DetailRow label="Selesai" value={formatDateTime(detail.completed_at)} />
            <DetailRow label="User" value={detail.user?.name ?? "-"} />
            <DetailRow label="Waktu" value={formatDateTime(detail.created_at)} />
          </dl>
        )}
      </Modal>
    </>
  );
}
