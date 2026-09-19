import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import Search from "@/components/ui/Search";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { roleService } from "../../api/role.service";
import { permissionService } from "../../api/permission.service";
import { PERMISSION_GROUPS } from "../../constants/permissionGroups";
import type { Permission, Role } from "../../api/types";

interface RoleFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Role | null;
  isAssignmentModal?: boolean;
  defaultPermissionIds?: number[];
}

export default function RoleForm({
  open,
  onClose,
  onSaved,
  initialData,
  isAssignmentModal = false,
  defaultPermissionIds = [],
}: RoleFormProps) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState(false);

  const [permissionSearch, setPermissionSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(PERMISSION_GROUPS.map((g) => g.label)),
  );

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

  const isAdminAssignment =
    isAssignmentModal &&
    initialData?.name?.toLowerCase().includes("administrator") === true;
  const excludedNames = isAdminAssignment
    ? new Set(["view-audit-logs", "manage-settings"])
    : new Set<string>();

  const availablePermissions = useMemo(
    () => permissions.filter((p) => !excludedNames.has(p.name)),
    [permissions, excludedNames],
  );

  const query = permissionSearch.trim().toLowerCase();

  const filteredPermissions = useMemo(() => {
    if (!query) return availablePermissions;
    return availablePermissions.filter(
      (permission) =>
        permission.name.toLowerCase().includes(query) ||
        permission.description?.toLowerCase().includes(query),
    );
  }, [availablePermissions, query]);

  const permByName = useMemo(
    () => new Map(availablePermissions.map((p) => [p.name, p])),
    [availablePermissions],
  );

  const groupsWithPerms = useMemo(() => {
    const grouped = PERMISSION_GROUPS.map((g) => ({
      ...g,
      perms: g.names
        .map((n) => permByName.get(n))
        .filter((p): p is Permission => !!p),
    }));
    const groupedNames = new Set(grouped.flatMap((g) => g.perms.map((p) => p.name)));
    const sisa = availablePermissions.filter((p) => !groupedNames.has(p.name));
    if (sisa.length > 0) {
      grouped.push({ label: "Sistem", names: [], perms: sisa });
    }
    return grouped;
  }, [permByName, availablePermissions]);

  const groupOf = useMemo(() => {
    const map = new Map<string, string>();
    groupsWithPerms.forEach((g) =>
      g.perms.forEach((p) => map.set(p.name, g.label)),
    );
    return map;
  }, [groupsWithPerms]);

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

  const isLoadingPermissions = permissionsLoading;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        isAssignmentModal
          ? `Lihat Hak Akses — ${initialData?.name ?? "Peran"}`
          : isEdit
            ? "Edit Peran"
            : "Tambah Peran"
      }
      size="lg"
      footer={
        isAssignmentModal ? (
          <Button variant="ghost" onClick={onClose}>
            Tutup
          </Button>
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
          {isLoadingPermissions ? (
            <div className="flex w-full items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
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
            <p className="rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
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

              {/* Search results — flat list with group labels */}
              {query ? (
                <div className="overflow-hidden rounded-2xl border border-outline-variant">
                  {filteredPermissions.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-on-surface-variant">
                      Tidak ada hak akses yang cocok dengan pencarian.
                    </p>
                  ) : (
                    <div className="max-h-[400px] divide-y divide-outline-variant overflow-y-auto">
                      {filteredPermissions.map((perm) => {
                        const checked = selectedIds.includes(perm.id);
                        const g = groupOf.get(perm.name);
                        return (
                          <div
                            key={perm.id}
                            className="flex items-start gap-3 px-4 py-3"
                          >
                            {checked && (
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            )}
                            <div className={`min-w-0 ${!checked ? "ml-7" : ""}`}>
                              <span className={`block text-sm font-medium ${checked ? "text-on-surface" : "text-on-surface-variant"}`}>
                                {perm.name}
                              </span>
                              {g && (
                                <span className="block text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant opacity-60">
                                  {g}
                                </span>
                              )}
                              {perm.description && (
                                <span className="block text-xs text-on-surface-variant">
                                  {perm.description}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Grouped accordion — no search active */
                <div className="space-y-2">
                  {groupsWithPerms.map((g) => {
                    const expanded = expandedGroups.has(g.label);
                    const selCount = g.perms.filter((p) =>
                      selectedIds.includes(p.id),
                    ).length;
                    return (
                      <div
                        key={g.label}
                        className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest"
                      >
                        {/* Group header */}
                        <button
                          type="button"
                          onClick={() => {
                            const next = new Set(expandedGroups);
                            if (next.has(g.label)) next.delete(g.label);
                            else next.add(g.label);
                            setExpandedGroups(next);
                          }}
                          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
                          aria-expanded={expanded}
                        >
                          <span className="flex items-center gap-2">
                            {g.label}
                            <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-[10px] font-medium text-on-surface-variant">
                              {g.perms.length}
                            </span>
                            {selCount > 0 && (
                              <span className="rounded-full bg-primary-container/20 px-2 py-0.5 text-[10px] font-medium text-primary">
                                {selCount} aktif
                              </span>
                            )}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-on-surface-variant transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                          />
                        </button>

                        {/* Group body */}
                        {expanded && (
                          <div className="border-t border-outline-variant px-2 py-2">
                            {g.perms.length === 0 ? (
                              <p className="px-4 py-3 text-sm text-on-surface-variant">
                                Tidak ada hak akses di grup ini.
                              </p>
                            ) : (
                              <div className="space-y-0.5">
                                {g.perms.map((p) => {
                                  const checked = selectedIds.includes(p.id);
                                  return (
                                    <div
                                      key={p.id}
                                      className="flex items-start gap-3 rounded-xl px-3 py-2"
                                    >
                                      {checked && (
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                      )}
                                      <div className={`min-w-0 ${!checked ? "ml-7" : ""}`}>
                                        <span className={`block text-sm font-medium ${checked ? "text-on-surface" : "text-on-surface-variant"}`}>
                                          {p.name}
                                        </span>
                                        {p.description && (
                                          <span className="block text-xs text-on-surface-variant">
                                            {p.description}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
