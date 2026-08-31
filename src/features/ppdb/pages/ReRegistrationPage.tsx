import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Eye } from "lucide-react";
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
import { reRegistrantService, reRegistrationService } from "../api/registration.service";
import type { Registrant } from "../api/types";
import RegistrantDetail from "@/features/ppdb/components/RegistrantDetail";

const PER_PAGE = 10;

export default function ReRegistrationPage() {
  const [data, setData] = useState<Registrant[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [query, setQuery] = useState<Record<string, string | number | undefined>>({
    page: 1,
    per_page: PER_PAGE,
  });

  const [actingId, setActingId] = useState<number | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<Registrant | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyNote, setVerifyNote] = useState("");
  const [detailTarget, setDetailTarget] = useState<Registrant | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }, []);

  const openDetail = useCallback((row: Registrant) => {
    setDetailTarget(row);
    setDetailOpen(true);
  }, []);

  const fetchList = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);
    reRegistrantService
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

  const handleDaftarUlang = useCallback(
    async (row: Registrant) => {
      setActingId(row.id);
      try {
        // Step 1: tandai data lengkap / daftar ulang di backend
        await reRegistrationService.completeData(row.id);
        // Step 2: download excel Dapodik per-row
        const blob = await reRegistrantService.exportDapodik({ id: row.id });
        downloadBlob(blob, `dapodik-${row.registration_number ?? row.id}.csv`);
        toast.success("Daftar ulang berhasil — file Dapodik terunduh.");
        fetchList();
      } catch (err) {
        toast.error("Gagal daftar ulang", { description: toApiError(err).message });
      } finally {
        setActingId(null);
      }
    },
    [fetchList, downloadBlob],
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
      } as const,
      {
        header: "Nama",
        accessor: "full_name",
        render: (_v: unknown, row: Row) => <span className="font-medium text-on-surface">{row.full_name}</span>,
      } as const,
      {
        header: "Status Daftar Ulang",
        accessor: "re_registration_status",
        render: (_v: unknown, row: Row) => (
          <Badge variant={row.re_registration_status === "completed" ? "success" : row.re_registration_status === "expired" ? "danger" : "warning"}>
            {row.re_registration_status ?? "pending"}
          </Badge>
        ),
      } as const,
      {
        header: "Status Siswa",
        accessor: "student_id",
        render: (_v: unknown, row: Row) =>
          row.student_id ? (
            <Badge variant="success">Sudah menjadi siswa</Badge>
          ) : (
            <Badge variant="neutral">Belum</Badge>
          ),
      } as const,
      {
        header: "Aksi",
        accessor: "id",
        headerClassName: "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_v: unknown, row: Row) => {
          const isCompleted = row.re_registration_status === "completed";
          const hasStudent = !!row.student_id;
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => openDetail(row)}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-on-surface transition-colors hover:bg-slate-200"
              >
                <Eye className="h-4 w-4" /> Detail
              </button>
              {!isCompleted && !hasStudent ? (
                <button
                  type="button"
                  onClick={() => handleDaftarUlang(row)}
                  disabled={actingId === row.id}
                  className="inline-flex items-center gap-1 rounded-lg bg-tertiary-container/20 px-3 py-1.5 text-sm font-medium text-tertiary transition-colors hover:bg-tertiary-container/40 disabled:opacity-50"
                >
                  <ClipboardCheck className="h-4 w-4" /> Daftar Ulang
                </button>
              ) : hasStudent ? (
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
      } as const,
    ];
  }, [actingId, handleDaftarUlang, openVerify, openDetail]);

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

      <RegistrantDetail open={detailOpen} registrant={detailTarget} onClose={() => setDetailOpen(false)} />
    </PageContainer>
  );
}
