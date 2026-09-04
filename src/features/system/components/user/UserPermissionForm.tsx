import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Search as SearchIcon, X } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { permissionService } from "../../api/permission.service";
import { userManagementService } from "../../api/user.service";
import type { Permission, UserManagement } from "../../api/types";

interface UserPermissionFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: UserManagement | null;
}

export default function UserPermissionForm({
  open,
  onClose,
  onSaved,
  initialData,
}: UserPermissionFormProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState(false);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const catalogLoadedRef = useRef(false);

  const loadCatalog = useCallback(() => {
    setCatalogLoading(true);
    setCatalogError(false);
    permissionService
      .list({ per_page: 100 })
      .then((res) => setPermissions(res.data))
      .catch(() => setCatalogError(true))
      .finally(() => setCatalogLoading(false));
  }, []);

  // Load catalog once + the user's current direct permissions whenever opened.
  useEffect(() => {
    if (!open) return;

    setError(null);
    setSearch("");

    if (!catalogLoadedRef.current) {
      catalogLoadedRef.current = true;
      loadCatalog();
    }

    // Fetch the user's current direct permissions (the list row does not
    // include them; `show` eager-loads role + permissions).
    if (initialData) {
      userManagementService
        .get(initialData.id)
        .then((res) => {
          const ids = res.data.permissions?.map((p) => p.id) ?? [];
          setSelectedIds(ids);
          setRolePermissions(res.data.role?.permissions ?? []);
        })
        .catch(() => {
          setSelectedIds([]);
          setRolePermissions([]);
        });
    } else {
      setSelectedIds([]);
      setRolePermissions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData, loadCatalog]);

  const togglePermission = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.length === filteredPermissions.length
        ? []
        : filteredPermissions.map((p) => p.id),
    );
  };

  const query = search.trim().toLowerCase();
  const filteredPermissions = query
    ? permissions.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query),
      )
    : permissions;

  const handleSave = async () => {
    if (!initialData) return;
    setSaving(true);
    setError(null);
    try {
      await userManagementService.syncPermissions(initialData.id, {
        permission_ids: selectedIds,
      });
      toast.success("Permission pengguna berhasil diperbarui.");
      onSaved();
      onClose();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      toast.error("Gagal memperbarui permission", {
        description: apiError.message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Atur Permission — ${initialData?.name ?? "Pengguna"}`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Simpan
          </Button>
        </>
      }
    >
      <div>
        <p className="mb-4 text-sm text-on-surface-variant">
          Permission dari role bersifat inheritan (read-only). Centang di bawah
          untuk menambahkan permission tambahan khusus pengguna ini.
        </p>

        {rolePermissions.length > 0 && (
          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-outline">
              Hak akses dari Role{initialData?.role?.name ? ` — ${initialData.role.name}` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {rolePermissions.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-on-surface-variant"
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-outline">
          Hak akses tambahan
        </p>

        {catalogLoading ? (
          <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Memuat permission...
          </div>
        ) : catalogError ? (
          <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
            <span>Gagal memuat permission.</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={loadCatalog}
              className="self-start"
            >
              Muat Ulang
            </Button>
          </div>
        ) : permissions.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
            Tidak ada permission yang tersedia.
          </p>
        ) : (
          <>
            <div className="relative mb-3">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" aria-hidden="true" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari permission..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm text-on-surface placeholder-outline transition-colors focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                aria-label="Cari permission"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-outline hover:text-on-surface"
                  aria-label="Hapus pencarian"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={toggleAll}
                className="flex w-full items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-on-surface hover:bg-slate-100"
              >
                <span>
                  Pilih Permission ({selectedIds.length}/{permissions.length})
                </span>
                <span className="text-on-surface-variant">Semua</span>
              </button>
              {filteredPermissions.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-on-surface-variant">
                  Tidak ada permission yang cocok dengan pencarian.
                </p>
              ) : (
                <div className="max-h-[320px] divide-y divide-slate-100 overflow-y-auto">
                  {filteredPermissions.map((perm) => {
                    const checked = selectedIds.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(perm.id)}
                          disabled={saving}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-container focus:ring-primary-container"
                        />
                        <div className="min-w-0">
                          <span className="block text-sm font-medium text-on-surface">
                            {perm.name}
                          </span>
                          {perm.description && (
                            <span className="block text-xs text-on-surface-variant">
                              {perm.description}
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {error && !error.errors && (
          <p className="mt-4 rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {error.message}
          </p>
        )}
      </div>
    </Modal>
  );
}
