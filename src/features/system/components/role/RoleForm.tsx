import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import Search from "@/components/ui/Search";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { roleService } from "../../api/role.service";
import { permissionService } from "../../api/permission.service";
import type { Permission, Role } from "../../api/types";

interface RoleFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Role | null;
  isAssignmentModal?: boolean;
  defaultPermissionIds?: number[];
  onSyncPermissions?: (ids: number[]) => void;
  syncLoading?: boolean;
  syncError?: string | null;
}

export default function RoleForm({
  open,
  onClose,
  onSaved,
  initialData,
  isAssignmentModal = false,
  defaultPermissionIds = [],
  onSyncPermissions,
  syncLoading = false,
  syncError = null,
}: RoleFormProps) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState(false);

  const [permissionSearch, setPermissionSearch] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const permissionsLoadedRef = useRef(false);

  const loadPermissions = useCallback(() => {
    setPermissionsLoading(true);
    permissionService
      .list({ per_page: 100 })
      .then((res) => {
        setPermissions(res.data);
        setPermissionsError(false);
      })
      .catch(() => {
        setPermissionsError(true);
      })
      .finally(() => {
        setPermissionsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);
    setFieldErrors({});
    setPermissionSearch("");

    if (isAssignmentModal) {
      const override =
        defaultPermissionIds.length > 0
          ? defaultPermissionIds
          : initialData?.permissions?.map((p) => p.id) ?? [];
      setSelectedIds(override);
      setName(initialData?.name ?? "");
      setDescription(initialData?.description ?? "");
    } else if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description ?? "");
      setSelectedIds(initialData.permissions?.map((p) => p.id) ?? []);
    } else {
      setName("");
      setDescription("");
      setSelectedIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isAssignmentModal, initialData]);

  useEffect(() => {
    // Muat katalog permission sekali saja (per montage komponen). Data ini
    // statis dan di-share untuk semua role, jadi cukup fetch satu kali.
    if (open && !permissionsLoadedRef.current) {
      permissionsLoadedRef.current = true;
      loadPermissions();
    }
  }, [open, loadPermissions]);

  const togglePermission = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.length === permissions.length
        ? []
        : permissions.map((p) => p.id),
    );
  };

  const filteredPermissions = useMemo(() => {
    const query = permissionSearch.trim().toLowerCase();
    if (!query) return permissions;
    return permissions.filter(
      (permission) =>
        permission.name.toLowerCase().includes(query) ||
        permission.description?.toLowerCase().includes(query),
    );
  }, [permissions, permissionSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      name,
      description: description.trim() || null,
      permission_ids: selectedIds,
    };

    try {
      if (initialData) {
        await roleService.update(initialData.id, payload);
        toast.success("Peran berhasil diperbarui.");
      } else {
        await roleService.create(payload);
        toast.success("Peran berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan peran", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAssignment = () => {
    if (onSyncPermissions) {
      onSyncPermissions(selectedIds);
    }
  };

  const isLoadingPermissions = permissionsLoading;
  const showAssignmentError =
    isAssignmentModal && syncError
      ? syncError
      : error && !error.errors
        ? error.message
        : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        isAssignmentModal
          ? `Atur Hak Akses — ${initialData?.name ?? "Peran"}`
          : isEdit
            ? "Edit Peran"
            : "Tambah Peran"
      }
      size="lg"
      footer={
        isAssignmentModal ? (
          <>
            <Button variant="ghost" onClick={onClose} disabled={syncLoading}>
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSubmitAssignment}
              loading={syncLoading}
            >
              Simpan Hak Akses
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Batal
            </Button>
            <Button type="submit" form="role-form" loading={submitting}>
              Simpan
            </Button>
          </>
        )
      }
    >
      {!isAssignmentModal ? (
        <form id="role-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
          <FormField label="Nama" required error={fieldErrors.name?.[0]}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth. Guru Mata Pelajaran"
              disabled={submitting}
            />
          </FormField>

          <FormField label="Deskripsi" error={fieldErrors.description?.[0]}>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi peran (opsional)"
              disabled={submitting}
            />
          </FormField>

          {error && !error.errors && (
            <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
              {error.message}
            </p>
          )}
        </form>
      ) : (
        <div>
          {description && (
            <p className="mb-4 text-sm text-on-surface-variant">{description}</p>
          )}
          {showAssignmentError && (
            <p className="mb-4 rounded-xl bg-error-container px-3 py-2 text-sm text-error">
              {showAssignmentError}
            </p>
          )}
          {isLoadingPermissions ? (
            <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Memuat hak akses...
            </div>
          ) : permissionsError ? (
            <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
              <span>Gagal memuat hak akses.</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={loadPermissions}
                className="self-start"
              >
                Muat Ulang
              </Button>
            </div>
          ) : permissions.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
              Tidak ada hak akses yang tersedia di dalam sistem.
            </p>
          ) : (
            <div>
              <Search
                value={permissionSearch}
                onChange={setPermissionSearch}
                placeholder="Cari hak akses..."
                className="mb-3"
              />
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="flex w-full items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-on-surface hover:bg-slate-100"
                >
                  <span>
                    Pilih Hak Akses ({selectedIds.length}/{permissions.length})
                  </span>
                  <span className="flex items-center gap-1 text-on-surface-variant">
                    Semua <ChevronDown className="h-4 w-4" />
                  </span>
                </button>
                {filteredPermissions.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-on-surface-variant">
                    Tidak ada hak akses yang cocok dengan pencarian.
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
                            disabled={syncLoading}
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
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
