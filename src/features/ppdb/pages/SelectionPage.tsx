import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import { FormField, Input } from "@/components/ui/Form";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { registrationService, selectionService } from "../api/registration.service";
import type { Registrant } from "../api/types";

const PER_PAGE = 10;

export default function SelectionPage() {
  const [data, setData] = useState<Registrant[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [query, setQuery] = useState<Record<string, string | number | undefined>>({
    verification_status: "verified",
    selection_status: "pending",
    page: 1,
    per_page: PER_PAGE,
  });

  const [scores, setScores] = useState<Record<number, string>>({});
  const [actingId, setActingId] = useState<number | null>(null);

  const fetchList = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);
    registrationService
      .list({ ...query })
      .then((res) => {
        if (!active) return;
        setData(res.data);
        if (res.meta) {
          setMeta(res.meta);
        }
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

  useEffect(() => {
    return fetchList();
  }, [fetchList]);

  const goToPage = useCallback((target: number) => {
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const handleSelect = useCallback(
    async (row: Registrant) => {
      const score = scores[row.id];
      if (!score) {
        toast.error("Isi skor seleksi terlebih dahulu.");
        return;
      }
      setActingId(row.id);
      try {
        const res = await selectionService.select(row.id, { selection_score: Number(score) });
        toast.success(res.message || "Pendaftar diterima.");
        fetchList();
      } catch (err) {
        toast.error("Gagal seleksi", { description: toApiError(err).message });
      } finally {
        setActingId(null);
      }
    },
    [scores, fetchList],
  );

  const handleNotSelect = useCallback(
    async (row: Registrant) => {
      setActingId(row.id);
      try {
        const res = await selectionService.notSelect(row.id);
        toast.success(res.message || "Pendaftar tidak lolos.");
        fetchList();
      } catch (err) {
        toast.error("Gagal", { description: toApiError(err).message });
      } finally {
        setActingId(null);
      }
    },
    [fetchList],
  );

  const columns = useMemo(() => {
    type Row = Registrant;
    return [
      {
        header: "No. Pendaftaran",
        accessor: "registration_number",
        render: (_v: unknown, row: Row) => (
          <div>
            <p className="font-semibold text-on-surface">{row.registration_number ?? "-"}</p>
            <p className="text-xs text-on-surface-variant">{row.full_name}</p>
          </div>
        ),
      },
      {
        header: "Nama",
        accessor: "full_name",
        render: (_v: unknown, row: Row) => <span className="font-medium text-on-surface">{row.full_name}</span>,
      },
      {
        header: "Program",
        accessor: "program_choice",
        render: (_v: unknown, row: Row) => <span className="text-sm uppercase text-on-surface-variant">{row.program_choice ?? "-"}</span>,
      },
      {
        header: "Skor",
        accessor: "selection_score",
        render: (_v: unknown, row: Row) => (
          <span className="text-sm font-semibold text-on-surface">{row.selection_score ?? "-"}</span>
        ),
      },
      {
        header: "Status Seleksi",
        accessor: "selection_status",
        render: (_v: unknown, row: Row) => (
          <Badge variant={row.selection_status === "selected" ? "success" : row.selection_status === "not_selected" ? "danger" : "neutral"}>
            {row.selection_status ?? "-"}
          </Badge>
        ),
      },
      {
        header: "Aksi",
        accessor: "id",
        headerClassName: "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_v: unknown, row: Row) => (
          <div className="flex items-center justify-center gap-2">
            <div className="w-24">
              <Input
                type="number"
                value={scores[row.id] ?? ""}
                onChange={(e) => setScores((prev) => ({ ...prev, [row.id]: e.target.value }))}
                placeholder="Skor"
                disabled={actingId === row.id}
                className="py-1.5"
              />
            </div>
            <button
              type="button"
              onClick={() => handleSelect(row)}
              disabled={actingId === row.id}
              className="inline-flex items-center gap-1 rounded-lg bg-tertiary-container/20 px-3 py-1.5 text-sm font-medium text-tertiary transition-colors hover:bg-tertiary-container/40 disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> Select
            </button>
            <button
              type="button"
              onClick={() => handleNotSelect(row)}
              disabled={actingId === row.id}
              className="inline-flex items-center gap-1 rounded-lg bg-error-container px-3 py-1.5 text-sm font-medium text-error transition-colors hover:bg-error-container/50 disabled:opacity-50"
            >
              <X className="h-4 w-4" /> Not Select
            </button>
          </div>
        ),
      },
    ];
  }, [scores, actingId, handleSelect, handleNotSelect]);

  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  return (
    <PageContainer className="py-6">
      <PageHeader title="Seleksi Pendaftar" description="Pilih pendaftar yang lolos seleksi." />

      <Card>
        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">{error.message}</p>
            <Button variant="secondary" onClick={fetchList}>Muat Ulang</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} loading={loading} emptyMessage="Tidak ada pendaftar untuk diseleksi." />
        )}

        {!error && !loading && meta.total > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-on-surface-variant">Menampilkan {from}-{to} dari {meta.total} data</p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" disabled={meta.current_page <= 1} onClick={() => goToPage(meta.current_page - 1)}>Sebelumnya</Button>
              <span className="text-sm text-on-surface-variant">Halaman {meta.current_page} dari {meta.last_page}</span>
              <Button variant="secondary" size="sm" disabled={meta.current_page >= meta.last_page} onClick={() => goToPage(meta.current_page + 1)}>Berikutnya</Button>
            </div>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
