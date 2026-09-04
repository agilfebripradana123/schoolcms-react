import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import AppSelect from "@/components/ui/Select";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { roleService } from "../api/role.service";
import { userManagementService } from "../api/user.service";
import type { Role, UserManagement } from "../api/types";
import UserForm from "../components/user/UserForm";
import UserPermissionForm from "../components/user/UserPermissionForm";
import UserDeleteDialog from "../components/user/UserDeleteDialog";
import Pagination from "../../../components/ui/Pagination";

const PER_PAGE = 10;

type StatusFilter = "all" | "active" | "inactive";

interface QueryState {
  q: string;
  role_id: number | undefined;
  is_active: boolean | undefined;
  page: number;
}

function statusToFilter(status: StatusFilter): boolean | undefined {
  if (status === "all") return undefined;
  return status === "active";
}

export default function UsersPage() {
  const [data, setData] = useState<UserManagement[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const [query, setQuery] = useState<QueryState>({
    q: "",
    role_id: undefined,
    is_active: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserManagement | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<UserManagement | null>(null);
  const [permOpen, setPermOpen] = useState(false);
  const [permUser, setPermUser] = useState<UserManagement | null>(null);

  const searchTimeout = useRef<number | null>(null);

  useEffect(() => {
    roleService
      .list({ per_page: 100 })
      .then((res) => setRoles(res.data))
      .catch(() => {
        toast.error("Gagal memuat role", {
          description: "Filter role tidak tersedia.",
        });
      });
  }, []);

  useEffect(() => {
    let active = true;

    userManagementService
      .list({
        q: query.q || undefined,
        role_id: query.role_id,
        is_active: query.is_active,
        page: query.page,
        per_page: PER_PAGE,
      })
      .then((res) => {
        if (!active) return;
        setData(res.data);
        setMeta(res.meta);
        setPage(res.meta.current_page);
      })
      .catch((err) => {
        if (!active) return;
        setError(toApiError(err));
        setData([]);
        toast.error("Gagal memuat data pengguna", {
          description: toApiError(err).message,
        });
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

  const handleRoleChange = useCallback((value: string) => {
    setLoading(true);
    setError(null);
    setRoleFilter(value);
    setQuery((prev) => ({
      ...prev,
      role_id: value === "all" ? undefined : Number(value),
      page: 1,
    }));
  }, []);

  const handleStatusChange = useCallback((value: StatusFilter) => {
    setLoading(true);
    setError(null);
    setStatus(value);
    setQuery((prev) => ({ ...prev, is_active: statusToFilter(value), page: 1 }));
  }, []);

  const goToPage = useCallback((target: number) => {
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const handleSaved = useCallback(
    (saved: UserManagement) => {
      setLoading(true);
      setError(null);
      setFormOpen(false);
      setEditing(null);
      setData((prev) =>
        prev.some((u) => u.id === saved.id)
          ? prev.map((u) => (u.id === saved.id ? saved : u))
          : [saved, ...prev],
      );
      setQuery((prev) => ({
        ...prev,
        page: Math.max(1, Math.min(prev.page, meta.last_page)),
      }));
    },
    [meta.last_page],
  );

  const handleDeleted = useCallback(() => {
    setLoading(true);
    setError(null);
    setDeleteOpen(false);
    setToDelete(null);
    const isLastPage = page > 1 && meta.total - 1 <= (page - 1) * meta.per_page;
    setQuery((prev) => ({
      ...prev,
      page: isLastPage ? page - 1 : page,
    }));
  }, [page, meta.total, meta.per_page]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: UserManagement) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: UserManagement) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const openPerm = useCallback((row: UserManagement) => {
    setPermUser(row);
    setPermOpen(true);
  }, []);

  const columns = useMemo(() => {
    type Row = UserManagement;
    return [
      {
        header: "Nama",
        accessor: "name" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="font-medium text-on-surface">{row.name}</span>
        ),
      },
      {
        header: "Username",
        accessor: "username" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{row.username ?? "-"}</span>
        ),
      },
      {
        header: "Email",
        accessor: "email" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{row.email}</span>
        ),
      },
      {
        header: "Role",
        accessor: "role" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-slate-700">{row.role?.name ?? "-"}</span>
        ),
      },
      {
        header: "Status",
        accessor: "is_active" as keyof Row,
        headerClassName: "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <Badge
            variant={row.is_active ? "success" : "secondary"}
            className="px-2.5 py-1 text-xs leading-4"
          >
            {row.is_active ? "Aktif" : "Tidak Aktif"}
          </Badge>
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
              onClick={() => openPerm(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label={`Atur permission ${row.name}`}
              title="Atur Permission"
            >
              <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
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
  }, [openEdit, openPerm, openDelete]);


  const roleFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Role" },
      ...roles.map((r) => ({ value: String(r.id), label: r.name })),
    ],
    [roles],
  );
  const statusFilterOptions = [
    { value: "all", label: "Semua Status" },
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Tidak Aktif" },
  ];

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Pengguna"
        description="Kelola pengguna dan hak akses di seluruh portal."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap *:md:gap-3">
          <div className="w-full md:max-w-xs">
            <Search
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari nama, email, atau username..."
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Role</span>
              <AppSelect
                options={roleFilterOptions}
                value={roleFilter}
                onChange={(v) => handleRoleChange(v ?? "all")}
                placeholder="Pilih Role"
                className="min-w-[180px]"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Status</span>
              <AppSelect
                options={statusFilterOptions}
                value={status}
                onChange={(v) => handleStatusChange((v ?? "all") as StatusFilter)}
                placeholder="Pilih Status"
                isSearchable={false}
                className="min-w-[180px]"
              />
            </label>
          </div>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data pengguna.</p>
            <Button
              variant="secondary"
              onClick={() => {
                setLoading(true);
                setError(null);
                setQuery((prev) => ({ ...prev }));
              }}
            >
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
                  Tidak ada pengguna.
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
                          {row.role?.name ?? "-"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-on-surface-variant">
                          {row.email}
                        </p>
                      </div>
                      <Badge
                        variant={row.is_active ? "success" : "secondary"}
                        className="shrink-0 px-2.5 py-1 text-xs leading-4"
                      >
                        {row.is_active ? "Aktif" : "Tidak Aktif"}
                      </Badge>
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
                        variant="secondary"
                        size="sm"
                        onClick={() => openPerm(row)}
                      >
                        <ShieldCheck className="h-4 w-4" /> Permission
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
                emptyMessage="Tidak ada pengguna."
              />
            </div>
          </>
        )}

        <Pagination meta={meta} onPageChange={goToPage} loading={loading} error={error} />
      </Card>

      <UserForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <UserDeleteDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setToDelete(null);
        }}
        onDeleted={handleDeleted}
        data={toDelete}
      />

      <UserPermissionForm
        open={permOpen}
        onClose={() => {
          setPermOpen(false);
          setPermUser(null);
        }}
        onSaved={() => {
          setLoading(true);
          setError(null);
          setQuery((prev) => ({ ...prev }));
        }}
        initialData={permUser}
      />
    </PageContainer>
  );
}
