import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import SortSelect from "@/components/ui/SortSelect";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { teacherService } from "../api/teacher.service";
import type { Teacher } from "../api/types";
import TeacherForm from "../components/TeacherForm";

const PER_PAGE = 10;

const SORT_OPTIONS = [
  { value: "nama-az", label: "Nama A–Z" },
  { value: "nama-za", label: "Nama Z–A" },
];

function formatDisplayName(t: Teacher): string {
  const parts = [
    t.prefix_title,
    t.full_name,
    t.suffix_title,
  ].filter(Boolean);
  return parts.join(" ");
}

const STATUS_META: Record<string, { label: string; variant: "success" | "warning" | "danger" | "primary" | "neutral" | "secondary" }> = {
  PNS: { label: "PNS", variant: "primary" },
  PPPK: { label: "PPPK", variant: "primary" },
  honorer: { label: "Honorer", variant: "warning" },
  kontrak: { label: "Kontrak", variant: "warning" },
  swasta: { label: "Swasta", variant: "neutral" },
};

function statusMeta(status?: string | null) {
  if (!status) return null;
  return STATUS_META[status] ?? { label: status, variant: "neutral" as const };
}

export default function TeacherListPage() {
  const [data, setData] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("nama-az");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Teacher | null>(null);

  const fetchList = useCallback(() => {
    let active = true;

    teacherService
      .list()
      .then((res) => {
        if (!active) return;
        setData(res.data);
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
  }, []);

  useEffect(() => {
    return fetchList();
  }, [fetchList]);

  // Client-side search
  const filtered = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const na = formatDisplayName(a);
      const nb = formatDisplayName(b);
      switch (sort) {
        case "nama-za":
          return nb.localeCompare(na, "id");
        default:
          return na.localeCompare(nb, "id");
      }
    });
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((t) =>
      [formatDisplayName(t), t.teacher_code, t.nip, t.phone, t.email, t.major]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [data, search, sort]);

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageData = useMemo(() => {
    const start = (safePage - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, safePage]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSort(value);
    setPage(1);
  }, []);

  const goToPage = useCallback((target: number) => {
    setPage(target);
  }, []);

  const handleSaved = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
    setLoading(true);
    setError(null);
    fetchList();
  }, [fetchList]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!toDelete) return;
    try {
      await teacherService.remove(toDelete.id);
      toast.warning(`Data guru ${formatDisplayName(toDelete)} berhasil dihapus.`);
      setDeleteOpen(false);
      setToDelete(null);
      setLoading(true);
      setError(null);
      fetchList();
    } catch (err) {
      toast.error("Gagal menghapus data guru", {
        description: toApiError(err).message,
      });
    }
  }, [toDelete, fetchList]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: Teacher) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Teacher) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = Teacher;
    return [
      {
        header: "Kode / NIP",
        accessor: "teacher_code" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <div>
            <p className="font-semibold text-on-surface">
              {row.teacher_code ?? "-"}
            </p>
            <p className="text-xs text-on-surface-variant">
              NIP: {row.nip ?? "-"}
            </p>
          </div>
        ),
      },
      {
        header: "Nama Guru",
        accessor: "full_name" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <div>
            <span className="font-medium text-on-surface">
              {formatDisplayName(row)}
            </span>
            {row.email && (
              <p className="text-xs text-on-surface-variant">{row.email}</p>
            )}
          </div>
        ),
      },
      {
        header: "L/P",
        accessor: "gender" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_val: unknown, row: Row) => (
          <Badge variant={row.gender === "L" ? "primary" : "neutral"}>
            {row.gender === "L" ? "Laki-laki" : "Perempuan"}
          </Badge>
        ),
      },
      {
        header: "Pendidikan",
        accessor: "last_education" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <span className="text-sm text-on-surface-variant">
            {row.last_education ?? "-"}
            {row.major ? ` · ${row.major}` : ""}
          </span>
        ),
      },
      {
        header: "Status",
        accessor: "employment_status" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_val: unknown, row: Row) => {
          const meta = statusMeta(row.employment_status);
          return (
            <div className="flex flex-col items-center gap-1">
              {meta ? (
                <Badge variant={meta.variant}>{meta.label}</Badge>
              ) : (
                <span className="text-sm text-on-surface-variant">
                  {row.employment_status ?? "-"}
                </span>
              )}
              {row.is_active !== undefined && (
                <Badge variant={row.is_active ? "success" : "danger"}>
                  {row.is_active ? "Aktif" : "Nonaktif"}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        header: "Telepon",
        accessor: "phone" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <span className="text-sm text-on-surface-variant">
            {row.phone ?? "-"}
          </span>
        ),
      },
      {
        header: "Aksi",
        accessor: "id" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_val: unknown, row: Row) => (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label={`Edit ${formatDisplayName(row)}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label={`Hapus ${formatDisplayName(row)}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        ),
      },
    ];
  }, [openEdit, openDelete]);

  const from = filtered.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1;
  const to = Math.min(safePage * PER_PAGE, filtered.length);

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Data Guru"
        description="Kelola seluruh data guru yang terdaftar."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah Guru
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <Search
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari nama / kode / NIP..."
            />
          </div>
          <div className="w-full sm:w-56">
            <SortSelect
              value={sort}
              options={SORT_OPTIONS}
              onChange={handleSortChange}
            />
          </div>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">{error.message}</p>
            <Button variant="secondary" onClick={() => {
              setLoading(true);
              setError(null);
              fetchList();
            }}>
              Muat Ulang
            </Button>
          </div>
        ) : (
          <>
            {/* Kartu untuk mobile */}
            <div className="space-y-3 sm:hidden">
              {loading ? (
                <div className="py-10 text-center text-slate-500">
                  Memuat data...
                </div>
              ) : pageData.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  {search ? "Tidak ada guru yang cocok." : "Belum ada data guru."}
                </div>
              ) : (
                pageData.map((row) => {
                  const meta = statusMeta(row.employment_status);
                  return (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-on-surface">
                          {formatDisplayName(row)}
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {row.teacher_code ?? "-"} · NIP {row.nip ?? "-"}
                        </p>
                      </div>
                      {meta ? (
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      ) : (
                        <span className="text-sm text-on-surface-variant">
                          {row.employment_status ?? "-"}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-on-surface-variant">
                      <p>
                        {row.last_education ?? "-"}
                        {row.major ? ` · ${row.major}` : ""}
                      </p>
                      <p>{row.phone ?? "-"}</p>
                      <p>
                        {row.birth_place ?? ""}
                        {row.birth_date
                          ? `${row.birth_place ? ", " : ""}${row.birth_date.substring(0, 10)}`
                          : ""}
                      </p>
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
                  );
                })
              )}
            </div>

            {/* Tabel untuk desktop */}
            <div className="hidden sm:block">
              <DataTable
                columns={columns}
                data={pageData}
                loading={loading}
                emptyMessage={
                  search ? "Tidak ada guru yang cocok." : "Belum ada data guru."
                }
              />
            </div>
          </>
        )}

        {!error && !loading && filtered.length > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-on-surface-variant">
              Menampilkan {from}-{to} dari {filtered.length} data
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => goToPage(safePage - 1)}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-on-surface-variant">
                Halaman {safePage} dari {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => goToPage(safePage + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      <TeacherForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Data Guru"
        description={`Apakah Anda yakin ingin menghapus data guru ${toDelete ? formatDisplayName(toDelete) : ""}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        destructive
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  );
}