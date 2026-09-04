import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { extracurricularService } from "../api/extracurricular.service";
import type { Extracurricular } from "../api/types";
import { formatSupervisor } from "../api/types";
import ExtracurricularForm from "../components/extracurricular/ExtracurricularForm";
import ExtracurricularDeleteDialog from "../components/extracurricular/ExtracurricularDeleteDialog";

export default function ExtracurricularsPage() {
  const [data, setData] = useState<Extracurricular[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Extracurricular | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Extracurricular | null>(null);

  const [search, setSearch] = useState("");

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);

    extracurricularService
      .list()
      .then((res: { data: Extracurricular[] }) => {
        setData(res.data);
      })
      .catch((err: unknown) => {
        const apiError = toApiError(err);
        setError(apiError);
        setData([]);
        toast.error("Gagal memuat data ekstrakurikuler", {
          description: apiError.message,
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
    setSearch("");
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

  const openEdit = useCallback((row: Extracurricular) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: Extracurricular) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = Extracurricular;
    return [
      {
        header: "Nama",
        accessor: "name" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="font-medium text-on-surface">{row.name}</span>
        ),
      },
      {
        header: "Pembina",
        accessor: "supervisor" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{formatSupervisor(row.supervisor)}</span>
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

  const filteredData = useMemo(() => {
    const lower = search.toLowerCase();
    return data.filter((row) => (row.name ?? "").toLowerCase().includes(lower));
  }, [data, search]);

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Ekstrakurikuler"
        description="Kelola data ekstrakurikuler sekolah."
        actions={
          <>
            <div className="w-64" style={{ marginRight: 12 }}>
              <Search
                value={search}
                onChange={setSearch}
                placeholder="Cari ekstrakurikuler..."
              />
            </div>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Tambah
            </Button>
          </>
        }
      />

      <Card>
        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data ekstrakurikuler.</p>
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
              ) : filteredData.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Tidak ada ekstrakurikuler.
                </div>
              ) : (
                filteredData.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-on-surface">{row.name}</p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {formatSupervisor(row.supervisor)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {row.description || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
                        <Pencil className="h-4 w-4" /> Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => openDelete(row)}>
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
                data={filteredData}
                loading={loading}
                emptyMessage="Tidak ada ekstrakurikuler."
              />
            </div>
          </>
        )}
      </Card>

      <ExtracurricularForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <ExtracurricularDeleteDialog
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