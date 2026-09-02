import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eye } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import Modal from "@/components/ui/Modal";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { auditLogService } from "../api/audit-log.service";
import type { AuditLog } from "../api/types";
import ErrorState from "../components/ErrorState";

const PER_PAGE = 10;

interface QueryState {
  q: string;
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

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid grid-cols-3 gap-3 border-b border-slate-100 py-2 last:border-0">
      <dt className="text-sm text-on-surface-variant">{label}</dt>
      <dd className="col-span-2 text-sm font-medium text-on-surface break-words">
        {value ?? "-"}
      </dd>
    </div>
  );
}

export default function AuditLogsPage() {
  const [data, setData] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState<QueryState>({ q: "", page: 1 });

  const [detail, setDetail] = useState<AuditLog | null>(null);

  const searchTimeout = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    auditLogService
      .list({ q: query.q || undefined, page: query.page, per_page: PER_PAGE })
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

  const openDetail = useCallback((row: AuditLog) => {
    setDetail(row);
  }, []);

  const columns = useMemo(() => {
    type Row = AuditLog;
    return [
      {
        header: "User",
        accessor: "user" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{row.user?.name ?? "-"}</span>
        ),
      },
      {
        header: "Action",
        accessor: "action" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <Badge variant="neutral">{row.action}</Badge>
        ),
      },
      {
        header: "Model",
        accessor: "model" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">
            {row.model ? `${row.model}${row.model_id != null ? ` #${row.model_id}` : ""}` : "-"}
          </span>
        ),
      },
      {
        header: "Deskripsi",
        accessor: "description" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="block max-w-xs truncate text-slate-700">{row.description}</span>
        ),
      },
      {
        header: "Waktu",
        accessor: "created_at" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="whitespace-nowrap text-slate-700">
            {formatDateTime(row.created_at)}
          </span>
        ),
      },
      {
        header: "Aksi",
        accessor: "id" as keyof Row,
        headerClassName: "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openDetail(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label={`Detail log ${row.id}`}
              title="Detail"
            >
              <Eye className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [openDetail]);

  const isFirstPage = meta.current_page <= 1;
  const isLastPage = meta.current_page >= meta.last_page;
  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Log Aktivitas"
        description="Riwayat aktivitas pengguna pada sistem (hanya baca)."
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <Search
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari deskripsi aktivitas..."
            />
          </div>
        </div>

        {error ? (
          <ErrorState error={error} onRetry={retry} />
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
                  Tidak ada log aktivitas.
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
                          {row.user?.name ?? "Sistem"}
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {row.model
                            ? `${row.model}${row.model_id != null ? ` #${row.model_id}` : ""}`
                            : "-"}
                        </p>
                      </div>
                      <Badge variant="neutral" className="shrink-0">
                        {row.action}
                      </Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">
                      {row.description}
                    </p>
                    <p className="mt-1 text-xs text-outline">
                      {formatDateTime(row.created_at)}
                    </p>
                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openDetail(row)}
                      >
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
                emptyMessage="Tidak ada log aktivitas."
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

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Detail Log Aktivitas"
        size="md"
        footer={
          <Button variant="ghost" onClick={() => setDetail(null)}>
            Tutup
          </Button>
        }
      >
        {detail && (
          <dl>
            <DetailRow label="User" value={detail.user?.name ?? "Sistem"} />
            <DetailRow label="Action" value={detail.action} />
            <DetailRow
              label="Model"
              value={
                detail.model
                  ? `${detail.model}${detail.model_id != null ? ` #${detail.model_id}` : ""}`
                  : null
              }
            />
            <DetailRow label="Model ID" value={detail.model_id} />
            <DetailRow label="Deskripsi" value={detail.description} />
            <DetailRow label="IP Address" value={detail.ip_address} />
            <DetailRow label="User Agent" value={detail.user_agent} />
            <DetailRow label="Waktu" value={formatDateTime(detail.created_at)} />
          </dl>
        )}
      </Modal>
    </PageContainer>
  );
}
