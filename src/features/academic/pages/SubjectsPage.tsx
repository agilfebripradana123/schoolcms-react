import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { subjectService } from "../api/subject.service";
import type { Subject } from "../api/types";
import SubjectForm from "../components/subject/SubjectForm";
import SubjectDeleteDialog from "../components/subject/SubjectDeleteDialog";

export default function SubjectsPage() {
  const [data, setData] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Subject | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);

    subjectService
      .list()
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        setError(toApiError(err));
        setData([]);
        toast.error("Gagal memuat data mata pelajaran", {
          description: toApiError(err).message,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaved = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
    loadData();
  }, [loadData]);

  const handleDeleted = useCallback(() => {
    setDeleteOpen(false);
    setToDelete(null);
    loadData();
  }, [loadData]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: Subject) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Subject) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = Subject;
    return [
      {
        header: "Kode",
        accessor: "code" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="font-medium text-on-surface">{row.code}</span>
        ),
      },
      {
        header: "Nama Mata Pelajaran",
        accessor: "name" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{row.name}</span>
        ),
      },
      {
        header: "Tipe",
        accessor: "type" as keyof Row,
        headerClassName: "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <Badge
            variant={row.type === "wajib" ? "primary" : "secondary"}
            className="px-2.5 py-1 text-xs leading-4"
          >
            {row.type === "wajib" ? "Wajib" : "Pilihan"}
          </Badge>
        ),
      },
      {
        header: "Deskripsi",
        accessor: "description" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{row.description || "-"}</span>
        ),
      },
      {
        header: "Aksi",
        accessor: "id" as keyof Row,
        headerClassName: "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label={`Edit ${row.name}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label={`Hapus ${row.name}`}
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
        title="Mata Pelajaran"
        description="Kelola data mata pelajaran yang digunakan dalam sistem akademik."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data mata pelajaran.</p>
            <Button variant="secondary" onClick={loadData}>
              Muat Ulang
            </Button>
          </div>
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
                  Tidak ada mata pelajaran.
                </div>
              ) : (
                data.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-on-surface">{row.name}</p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {row.code}
                        </p>
                      </div>
                      <Badge
                        variant={row.type === "wajib" ? "primary" : "secondary"}
                        className="shrink-0 px-2.5 py-1 text-xs leading-4"
                      >
                        {row.type === "wajib" ? "Wajib" : "Pilihan"}
                      </Badge>
                    </div>
                    {row.description && (
                      <p className="mt-2 text-xs text-on-surface-variant">
                        {row.description}
                      </p>
                    )}
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
                emptyMessage="Tidak ada mata pelajaran."
              />
            </div>
          </>
        )}
      </Card>

      <SubjectForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <SubjectDeleteDialog
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
