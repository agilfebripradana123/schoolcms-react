import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { teacherDocumentService } from "../api/teacher-document.service";
import { formatTeacherName, type TeacherDocument } from "../api/types";
import TeacherDocumentForm from "../components/TeacherDocumentForm";

const PER_PAGE = 10;

const DOCUMENT_TYPE_META: Record<string, { label: string; variant: "success" | "warning" | "danger" | "primary" | "neutral" }> = {
  sk: { label: "SK", variant: "primary" },
  ijazah: { label: "Ijazah", variant: "success" },
  sertifikat: { label: "Sertifikat", variant: "warning" },
  kontrak: { label: "Kontrak", variant: "neutral" },
};

function documentTypeMeta(type?: string | null) {
  if (!type) return null;
  return DOCUMENT_TYPE_META[type] ?? { label: type, variant: "neutral" as const };
}

function teacherName(d: TeacherDocument): string {
  return d.teacher ? formatTeacherName(d.teacher) : `#${d.teacher_id}`;
}

export default function TeacherDocumentListPage() {
  const [data, setData] = useState<TeacherDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TeacherDocument | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<TeacherDocument | null>(null);

  const fetchList = useCallback(() => {
    let active = true;

    teacherDocumentService
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
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((d) =>
      [teacherName(d), d.title, d.document_type, d.issued_date, d.notes]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [data, search]);

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
      await teacherDocumentService.remove(toDelete.id);
      toast.warning("Dokumen guru berhasil dihapus.");
      setDeleteOpen(false);
      setToDelete(null);
      setLoading(true);
      setError(null);
      fetchList();
    } catch (err) {
      toast.error("Gagal menghapus dokumen", {
        description: toApiError(err).message,
      });
    }
  }, [toDelete, fetchList]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: TeacherDocument) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: TeacherDocument) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = TeacherDocument;
    return [
      {
        header: "Guru",
        accessor: "teacher" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <div>
            <p className="font-medium text-on-surface">{teacherName(row)}</p>
            {row.teacher?.nip && (
              <p className="text-xs text-on-surface-variant">NIP: {row.teacher.nip}</p>
            )}
          </div>
        ),
      },
      {
        header: "Judul Dokumen",
        accessor: "title" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <div>
            <p className="font-medium text-on-surface">{row.title ?? "-"}</p>
            {row.notes && (
              <p className="text-xs text-on-surface-variant">{row.notes}</p>
            )}
          </div>
        ),
      },
      {
        header: "Jenis",
        accessor: "document_type" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_val: unknown, row: Row) => {
          const meta = documentTypeMeta(row.document_type);
          if (!meta) {
            return <span className="text-sm text-on-surface-variant">{row.document_type ?? "-"}</span>;
          }
          return <Badge variant={meta.variant}>{meta.label}</Badge>;
        },
      },
      {
        header: "Tanggal Terbit",
        accessor: "issued_date" as keyof Row,
        render: (_val: unknown, row: Row) => (
          <span className="text-sm text-on-surface-variant">
            {row.issued_date ? row.issued_date.substring(0, 10) : "-"}
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
              aria-label={`Edit dokumen ${row.title ?? ""}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label="Hapus dokumen"
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
        title="Dokumen Guru"
        description="Kelola dokumen dan berkas guru."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah Dokumen
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <Search
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari guru / judul / jenis..."
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
                  {search ? "Tidak ada dokumen yang cocok." : "Belum ada data dokumen."}
                </div>
              ) : (
                pageData.map((row) => {
                  const meta = documentTypeMeta(row.document_type);
                  return (
                    <div
                      key={row.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-on-surface">
                            {teacherName(row)}
                          </p>
                          <p className="mt-0.5 text-xs text-on-surface-variant">
                            {row.title ?? "-"}
                          </p>
                        </div>
                        {meta ? (
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        ) : (
                          <span className="text-sm text-on-surface-variant">
                            {row.document_type ?? "-"}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 space-y-1 text-sm text-on-surface-variant">
                        {row.issued_date && (
                          <p>Terbit: {row.issued_date.substring(0, 10)}</p>
                        )}
                        {row.notes && <p>{row.notes}</p>}
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
                  search ? "Tidak ada dokumen yang cocok." : "Belum ada data dokumen."
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

      <TeacherDocumentForm
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
        title="Hapus Dokumen"
        description={`Apakah Anda yakin ingin menghapus dokumen ${toDelete?.title || ""} milik ${toDelete ? teacherName(toDelete) : ""}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        destructive
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  );
}