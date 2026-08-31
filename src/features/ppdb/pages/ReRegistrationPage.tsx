import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import { FormField, Textarea } from "@/components/ui/Form";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { registrationService, reRegistrationService } from "../api/registration.service";
import type { Registrant } from "../api/types";

const PER_PAGE = 10;

function fmtDate(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value.substring(0, 10)
    : d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function ReRegistrationPage() {
  const [data, setData] = useState<Registrant[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [query, setQuery] = useState<Record<string, string | number | undefined>>({
    selection_status: "selected",
    page: 1,
    per_page: PER_PAGE,
  });

  const [actingId, setActingId] = useState<number | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<Registrant | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyNote, setVerifyNote] = useState("");

  const fetchList = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);
    registrationService
      .list({ ...query })
      .then((res) => {
        if (!active) return;
        setData(res.data);
        if (res.meta) setMeta(res.meta);
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

  const handleReRegister = useCallback(
    async (row: Registrant) => {
      setActingId(row.id);
      try {
        const res = await reRegistrationService.reRegister(row.id);
        toast.success(res.message || "Daftar ulang berhasil.");
        fetchList();
      } catch (err) {
        toast.error("Gagal daftar ulang", { description: toApiError(err).message });
      } finally {
        setActingId(null);
      }
    },
    [fetchList],
  );

  const openVerify = useCallback((row: Registrant) => {
    setVerifyTarget(row);
    setVerifyNote("");
    setVerifyOpen(true);
  }, []);

  const handleVerify = useCallback(async () => {
    if (!verifyTarget) return;
    setActingId(verifyTarget.id);
    try {
      const res = await reRegistrationService.verifyReRegistration(verifyTarget.id, {
        re_registration_notes: verifyNote.trim() || undefined,
      });
      toast.success(res.message || "Verifikasi daftar ulang berhasil.");
      setVerifyOpen(false);
      setVerifyTarget(null);
      fetchList();
    } catch (err) {
      toast.error("Gagal verifikasi daftar ulang", { description: toApiError(err).message });
    } finally {
      setActingId(null);
    }
  }, [verifyTarget, verifyNote, fetchList]);

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
        header: "Status Daftar Ulang",
        accessor: "re_registration_status",
        render: (_v: unknown, row: Row) => (
          <Badge variant={row.re_registration_status === "completed" ? "success" : row.re_registration_status === "expired" ? "danger" : "warning"}>
            {row.re_registration_status ?? "pending"}
          </Badge>
        ),
      },
      {
        header: "Tanggal Daftar Ulang",
        accessor: "re_registration_date",
        render: (_v: unknown, row: Row) => <span className="text-sm text-on-surface-variant">{fmtDate(row.re_registration_date)}</span>,
      },
      {
        header: "Status Siswa",
        accessor: "student_id",
        render: (_v: unknown, row: Row) =>
          row.student_id ? (
            <Badge variant="success">Sudah menjadi siswa</Badge>
          ) : (
            <Badge variant="neutral">Belum</Badge>
          ),
      },
      {
        header: "Aksi",
        accessor: "id",
        headerClassName: "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_v: unknown, row: Row) => {
          const done = row.re_registration_status === "completed" || row.student_id;
          return (
            <div className="flex items-center justify-center gap-2">
              {!done ? (
                <button
                  type="button"
                  onClick={() => handleReRegister(row)}
                  disabled={actingId === row.id}
                  className="inline-flex items-center gap-1 rounded-lg bg-tertiary-container/20 px-3 py-1.5 text-sm font-medium text-tertiary transition-colors hover:bg-tertiary-container/40 disabled:opacity-50"
                >
                  <ClipboardCheck className="h-4 w-4" /> Daftar Ulang
                </button>
              ) : row.student_id ? (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-tertiary">
                  <CheckCircle2 className="h-4 w-4" /> Selesai
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => openVerify(row)}
                  disabled={actingId === row.id}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary-container/15 px-3 py-1.5 text-sm font-medium text-primary-container transition-colors hover:bg-primary-container/30 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" /> Verifikasi Daftar Ulang
                </button>
              )}
            </div>
          );
        },
      },
    ];
  }, [actingId, handleReRegister, openVerify]);

  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  return (
    <PageContainer className="py-6">
      <PageHeader title="Daftar Ulang" description="Kelola daftar ulang pendaftar yang telah lolos seleksi." />

      <Card>
        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">{error.message}</p>
            <Button variant="secondary" onClick={fetchList}>Muat Ulang</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} loading={loading} emptyMessage="Tidak ada pendaftar untuk daftar ulang." />
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
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        title="Verifikasi Daftar Ulang"
        description="Pastikan pendaftar telah menyelesaikan daftar ulang."
        confirmText="Verifikasi"
        cancelText="Batal"
        onConfirm={handleVerify}
      >
        <div className="mt-3">
          <FormField label="Catatan">
            <Textarea value={verifyNote} onChange={(e) => setVerifyNote(e.target.value)} placeholder="Catatan verifikasi daftar ulang" rows={3} />
          </FormField>
        </div>
      </ConfirmDialog>
    </PageContainer>
  );
}
