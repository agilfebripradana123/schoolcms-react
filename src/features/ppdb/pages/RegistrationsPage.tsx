import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import { FormField, Select } from "@/components/ui/Form";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { registrationService } from "../api/registration.service";
import type { Registrant } from "../api/types";
import RegistrantForm from "../components/RegistrantForm";
import RegistrantDetail from "../components/RegistrantDetail";

const PER_PAGE = 10;

const STATUS_META: Record<string, { label: string; variant: "success" | "warning" | "danger" | "primary" | "neutral" }> = {
  draft: { label: "Draft", variant: "neutral" },
  submitted: { label: "Diajukan", variant: "primary" },
  verified: { label: "Terverifikasi", variant: "success" },
  selected: { label: "Diterima", variant: "success" },
  not_selected: { label: "Tidak Lolos", variant: "danger" },
  re_registered: { label: "Daftar Ulang", variant: "primary" },
  cancelled: { label: "Dibatalkan", variant: "danger" },
};

function statusBadge(status?: string) {
  const meta = STATUS_META[status ?? ""];
  return meta ? <Badge variant={meta.variant}>{meta.label}</Badge> : <Badge variant="neutral">{status ?? "-"}</Badge>;
}

const VERIFICATION_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];
const SELECTION_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "pending", label: "Pending" },
  { value: "selected", label: "Selected" },
  { value: "not_selected", label: "Not Selected" },
];
const MAIN_STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Diajukan" },
  { value: "verified", label: "Terverifikasi" },
  { value: "selected", label: "Diterima" },
  { value: "not_selected", label: "Tidak Lolos" },
  { value: "re_registered", label: "Daftar Ulang" },
  { value: "cancelled", label: "Dibatalkan" },
];
const PATH_OPTIONS = [
  { value: "", label: "Semua Jalur" },
  { value: "prestasi", label: "Prestasi" },
  { value: "reguler", label: "Reguler" },
  { value: "afirmasi", label: "Afirmasi" },
  { value: "mutasi", label: "Mutasi" },
];

const PROGRAM_OPTIONS = [
  { value: "", label: "Semua Program" },
  { value: "ipa", label: "IPA" },
  { value: "ips", label: "IPS" },
  { value: "bahasa", label: "Bahasa" },
  { value: "lainnya", label: "Lainnya" },
];

export default function RegistrationsPage() {
  const [data, setData] = useState<Registrant[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [selectionFilter, setSelectionFilter] = useState("");
  const [pathFilter, setPathFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");

  const [query, setQuery] = useState<Record<string, string | number | undefined>>({ page: 1, per_page: PER_PAGE });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Registrant | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Registrant | null>(null);
  const [detail, setDetail] = useState<Registrant | null>(null);

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

  const applyFilter = useCallback(
    (patch: Record<string, string>) => {
      setQuery((prev) => ({ ...prev, ...patch, page: 1 }));
    },
    [],
  );

  const handleSearch = useCallback(() => {
    applyFilter({ search: search.trim() || "none" });
  }, [applyFilter, search]);

  const goToPage = useCallback((target: number) => {
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const handleSaved = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
    setQuery((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!toDelete) return;
    try {
      await registrationService.remove(toDelete.id);
      toast.warning(`Pendaftaran ${toDelete.full_name} berhasil dihapus.`);
      setDeleteOpen(false);
      setToDelete(null);
      fetchList();
    } catch (err) {
      toast.error("Gagal menghapus pendaftaran", { description: toApiError(err).message });
    }
  }, [toDelete, fetchList]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);
  const openEdit = useCallback((row: Registrant) => {
    setEditing(row);
    setFormOpen(true);
  }, []);
  const openDelete = useCallback((row: Registrant) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);
  const openDetail = useCallback(
    async (row: Registrant) => {
      try {
        const res = await registrationService.get(row.id);
        setDetail(res.data);
      } catch (err) {
        toast.error("Gagal memuat detail", { description: toApiError(err).message });
        setDetail(row);
      }
    },
    [],
  );

const columns = useMemo(() => {
    type Row = Registrant;
    return [
      {
        header: "No. Pendaftaran",
        accessor: "registration_number" as const,
        render: (_v: unknown, row: Row) => (
          <div>
            <p className="font-semibold text-on-surface">{row.registration_number ?? "-"}</p>
            <p className="text-xs text-on-surface-variant">{row.created_at?.substring(0, 10) ?? ""}</p>
          </div>
        ),
      },
      {
        header: "Nama",
        accessor: "full_name" as const,
        render: (_v: unknown, row: Row) => (
          <div>
            <p className="font-medium text-on-surface">{row.full_name}</p>
            <p className="text-xs text-on-surface-variant">{row.email ?? ""}</p>
          </div>
        ),
      },
      {
        header: "NISN",
        accessor: "nisn" as const,
        render: (_v: unknown, row: Row) => (
          <span className="text-sm text-on-surface-variant">{row.nisn ?? "-"}</span>
        ),
      },
      {
        header: "Email",
        accessor: "email" as const,
        render: (_v: unknown, row: Row) => (
          <span className="text-sm text-on-surface-variant">{row.email ?? "-"}</span>
        ),
      },
      {
        header: "Status",
        accessor: "status" as const,
        render: (_v: unknown, row: Row) => statusBadge(row.status),
      },
      {
        header: "Verifikasi",
        accessor: "verification_status" as const,
        render: (_v: unknown, row: Row) => (
          <Badge variant={row.verification_status === "verified" ? "success" : row.verification_status === "rejected" ? "danger" : "neutral"}>
            {row.verification_status ?? "-"}
          </Badge>
        ),
      },
      {
        header: "Aksi",
        accessor: "id" as const,
        headerClassName: "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_v: unknown, row: Row) => (
          <div className="flex items-center justify-center gap-2">
            <button type="button" onClick={() => openDetail(row)} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container" aria-label="Detail">
              <Eye className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => openEdit(row)} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container" aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => openDelete(row)} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error" aria-label="Hapus">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ];
  }, [openEdit, openDelete, openDetail]);

  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);
  const isFirst = meta.current_page <= 1;
  const isLast = meta.current_page >= meta.last_page;

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Pendaftaran PPDB"
        description="Kelola seluruh pendaftaran PPDB."
        actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Tambah Pendaftar</Button>}
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="w-full sm:max-w-xs">
              <div className="flex gap-2">
                <Search value={search} onChange={setSearch} placeholder="Cari nama / email..." />
                <Button variant="secondary" onClick={handleSearch}>Cari</Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <FormField label="Status" className="w-full sm:w-48">
              <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); applyFilter({ status: e.target.value || "none" }); }} options={MAIN_STATUS_OPTIONS} />
            </FormField>
            <FormField label="Verifikasi" className="w-full sm:w-48">
              <Select value={verificationFilter} onChange={(e) => { setVerificationFilter(e.target.value); applyFilter({ verification_status: e.target.value || "none" }); }} options={VERIFICATION_OPTIONS} />
            </FormField>
            <FormField label="Seleksi" className="w-full sm:w-48">
              <Select value={selectionFilter} onChange={(e) => { setSelectionFilter(e.target.value); applyFilter({ selection_status: e.target.value || "none" }); }} options={SELECTION_OPTIONS} />
            </FormField>
            <FormField label="Jalur" className="w-full sm:w-48">
              <Select value={pathFilter} onChange={(e) => { setPathFilter(e.target.value); applyFilter({ registration_path: e.target.value || "none" }); }} options={PATH_OPTIONS} />
            </FormField>
            <FormField label="Program" className="w-full sm:w-48">
              <Select value={programFilter} onChange={(e) => { setProgramFilter(e.target.value); applyFilter({ program_choice: e.target.value || "none" }); }} options={PROGRAM_OPTIONS} />
            </FormField>
          </div>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">{error.message}</p>
            <Button variant="secondary" onClick={fetchList}>Muat Ulang</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} loading={loading} emptyMessage="Belum ada pendaftaran." />
        )}

        {!error && !loading && meta.total > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-on-surface-variant">Menampilkan {from}-{to} dari {meta.total} data</p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" disabled={isFirst} onClick={() => goToPage(meta.current_page - 1)}>Sebelumnya</Button>
              <span className="text-sm text-on-surface-variant">Halaman {meta.current_page} dari {meta.last_page}</span>
              <Button variant="secondary" size="sm" disabled={isLast} onClick={() => goToPage(meta.current_page + 1)}>Berikutnya</Button>
            </div>
          </div>
        )}
      </Card>

      <RegistrantForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSaved={handleSaved}
        initialData={editing}
      />
      <RegistrantDetail
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        registrant={detail}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Pendaftaran"
        description={`Apakah Anda yakin ingin menghapus pendaftaran ${toDelete?.full_name || ""}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        destructive
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  );
}
