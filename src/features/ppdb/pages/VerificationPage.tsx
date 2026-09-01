import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import AppSelect from "@/components/ui/Select";
import { FormField, Textarea } from "@/components/ui/Form";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { registrationService, verificationService } from "../api/registration.service";
import type { Registrant } from "../api/types";

const PER_PAGE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: "none", label: "Verifikasi: Pending" },
  { value: "verified", label: "Verifikasi: Verified" },
  { value: "rejected", label: "Verifikasi: Rejected" },
];

export default function VerificationPage() {
  const [data, setData] = useState<Registrant[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [verificationFilter, setVerificationFilter] = useState("pending");

  const [query, setQuery] = useState<Record<string, string | number | undefined>>({
    verification_status: "pending",
    page: 1,
    per_page: PER_PAGE,
  });

  const [rejectTarget, setRejectTarget] = useState<Registrant | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);

  const fetchList = useCallback(() => {
    let active = true;
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

  const changeFilter = useCallback((value: string) => {
    setVerificationFilter(value);
    setQuery((prev) => ({ ...prev, verification_status: value === "none" ? undefined : value, page: 1 }));
  }, []);

  const goToPage = useCallback((target: number) => {
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const handleVerify = useCallback(
    async (row: Registrant) => {
      setActingId(row.id);
      try {
        const res = await verificationService.verify(row.id);
        toast.success(res.message || "Berhasil diverifikasi.");
        fetchList();
      } catch (err) {
        toast.error("Gagal verifikasi", { description: toApiError(err).message });
      } finally {
        setActingId(null);
      }
    },
    [fetchList],
  );

  const openReject = useCallback((row: Registrant) => {
    setRejectTarget(row);
    setRejectNote("");
    setRejectOpen(true);
  }, []);

  const handleReject = useCallback(async () => {
    if (!rejectTarget) return;
    setActingId(rejectTarget.id);
    try {
      const res = await verificationService.reject(rejectTarget.id, {
        verification_notes: rejectNote.trim() || undefined,
      });
      toast.success(res.message || "Berhasil ditolak.");
      setRejectOpen(false);
      setRejectTarget(null);
      fetchList();
    } catch (err) {
      toast.error("Gagal menolak", { description: toApiError(err).message });
    } finally {
      setActingId(null);
    }
  }, [rejectTarget, rejectNote, fetchList]);

  const columns = useMemo(() => {
    type Row = Registrant;
    return [
      {
        header: "No. Pendaftaran",
        accessor: "registration_number" as const,
        render: (_v: unknown, row: Row) => (
          <div>
            <p className="font-semibold text-on-surface">{row.registration_number ?? "-"}</p>
            <p className="text-xs text-on-surface-variant">{row.full_name}</p>
          </div>
        ),
      },
      {
        header: "Nama",
        accessor: "full_name" as const,
        render: (_v: unknown, row: Row) => <span className="font-medium text-on-surface">{row.full_name}</span>,
      },
      {
        header: "Status",
        accessor: "verification_status" as const,
        render: (_v: unknown, row: Row) => (
          <Badge variant={row.verification_status === "verified" ? "success" : row.verification_status === "rejected" ? "danger" : "neutral"}>
            {row.verification_status ?? "pending"}
          </Badge>
        ),
      },
      {
        header: "Aksi",
        accessor: "id" as const,
        render: (_v: unknown, row: Row) => (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => handleVerify(row)}
              disabled={actingId === row.id}
              className="inline-flex items-center gap-1 rounded-lg bg-tertiary-container/20 px-3 py-1.5 text-sm font-medium text-tertiary transition-colors hover:bg-tertiary-container/40 disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> Verify
            </button>
            <button
              type="button"
              onClick={() => openReject(row)}
              disabled={actingId === row.id}
              className="inline-flex items-center gap-1 rounded-lg bg-error-container px-3 py-1.5 text-sm font-medium text-error transition-colors hover:bg-error-container/50 disabled:opacity-50"
            >
              <X className="h-4 w-4" /> Reject
            </button>
          </div>
        ),
      },
    ];
  }, [actingId, handleVerify, openReject]);

  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  return (
    <PageContainer className="py-6">
      <PageHeader title="Verifikasi Pendaftar" description="Verifikasi atau tolak pendaftaran PPDB." />

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center *:sm:gap-3">
          <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
            <span className="whitespace-nowrap">Status Verifikasi</span>
            <AppSelect
              options={STATUS_FILTER_OPTIONS}
              value={verificationFilter}
              onChange={(v) => changeFilter(v ?? "none")}
              placeholder="Pilih Status"
              isSearchable={false}
              className="min-w-[180px]"
            />
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">{error.message}</p>
            <Button variant="secondary" onClick={() => {
              setLoading(true);
              setError(null);
              fetchList();
            }}>Muat Ulang</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} loading={loading} emptyMessage="Tidak ada pendaftar untuk diverifikasi." />
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

      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Tolak Pendaftaran"
        description="Masukkan alasan penolakan (opsional)."
        confirmText="Tolak"
        cancelText="Batal"
        destructive
        onConfirm={handleReject}
      >
        <div className="mt-3">
          <FormField label="Catatan Penolakan">
            <Textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Alasan penolakan" rows={3} />
          </FormField>
        </div>
      </ConfirmDialog>
    </PageContainer>
  );
}
