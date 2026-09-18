import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Search from "@/components/ui/Search";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { permissionService } from "../../api/permission.service";
import { userManagementService } from "../../api/user.service";
import type { Permission, UserManagement } from "../../api/types";

interface GroupDef {
  label: string;
  names: string[];
}

const GROUPS: GroupDef[] = [
  { label: "Akademik", names: ["manage-classes","manage-schedules","manage-subjects","manage-academic-years","view-classes","view-students","view-schedules","view-attendance","manage-attendance","view-grades","manage-grades","view-assignments","manage-assignments","finalize-grades"] },
  { label: "Ujian", names: ["manage-exams","view-exams","view-exam-schedules","view-exam-results","view-exam-monitoring"] },
  { label: "Siswa", names: ["manage-students","view-achievements","view-violations","view-extracurricular","view-counselings"] },
  { label: "Keuangan", names: ["manage-finance","manage-scholarships","view-finance","view-billings","view-payments","view-transactions","view-scholarships"] },
  { label: "Operasional", names: ["manage-announcements","manage-notifications","manage-calendars","manage-facilities","view-reports"] },
  { label: "Manajemen", names: ["manage-teachers","manage-staff","manage-development","manage-letters","manage-documents"] },
];

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

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(GROUPS.map((g) => g.label)),
  );

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
          const userPerms = res.data.permissions ?? [];
          const rolePerms = res.data.role?.permissions ?? [];
          // UserResource injects GURU_DEFAULT_PERMISSIONS (and the admin
          // catalog) into role.permissions, so inherited grants must drop out
          // of the "additional" list — even when stale direct rows still exist
          // in permission_user from before they became defaults.
          const rolePermIds = new Set(rolePerms.map((p) => p.id));
          const filteredUserIds = userPerms
            .filter((p) => !rolePermIds.has(p.id))
            .map((p) => p.id);
          setSelectedIds(filteredUserIds);
          setRolePermissions(rolePerms);
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

  const rolePermIds = new Set(rolePermissions.map((p) => p.id));
  const excludedNames = new Set(["view-audit-logs", "manage-settings", "manage-users", "manage-roles", "manage-ppdb"]);
  const additionalPermissions = permissions.filter(
    (p) => !rolePermIds.has(p.id) && !excludedNames.has(p.name),
  );
  const selectedPermissions = permissions.filter(
    (p) => selectedIds.includes(p.id) && !excludedNames.has(p.name),
  );

  // ---- Group logic ----
  const permByName = new Map(permissions.map((p) => [p.name, p]));
  const groupsWithPerms = GROUPS.map((g) => ({
    ...g,
    perms: g.names
      .map((n) => permByName.get(n))
      .filter(
        (p): p is Permission =>
          !!p && !rolePermIds.has(p.id) && !excludedNames.has(p.name),
      ),
  }));

  const groupOf = new Map<string, string>();
  groupsWithPerms.forEach((g) =>
    g.perms.forEach((p) => groupOf.set(p.name, g.label)),
  );

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const toggleAllGroup = (label: string) => {
    const g = groupsWithPerms.find((x) => x.label === label);
    if (!g) return;
    const ids = g.perms.map((p) => p.id);
    const allSel = ids.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) => {
      if (allSel) return prev.filter((id) => !ids.includes(id));
      return [...prev, ...ids.filter((id) => !prev.includes(id))];
    });
  };

  const allAdditionalIds = additionalPermissions.map((p) => p.id);
  const allAdditionalSelected =
    allAdditionalIds.length > 0 &&
    allAdditionalIds.every((id) => selectedIds.includes(id));

  const toggleAllGlobal = () => {
    setSelectedIds((prev) => {
      const allSel = allAdditionalIds.length > 0 && allAdditionalIds.every((id) => prev.includes(id));
      if (allSel) return [];
      const merged = new Set(prev);
      for (const id of allAdditionalIds) merged.add(id);
      return Array.from(merged);
    });
  };

  // Search: filter across all groups, attach group label
  const query = search.trim().toLowerCase();
  const filteredPermissions = query
    ? additionalPermissions.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query),
      )
    : additionalPermissions;

  const handleSave = async () => {
    if (!initialData) return;
    setSaving(true);
    setError(null);
    try {
      await userManagementService.syncPermissions(initialData.id, {
        permission_ids: selectedIds,
      });
      toast.success("Permission pengguna berhasil diperbarui.", {
        description:
          "Guru harus menyegarkan halaman/fokus tab browser agar perubahan aktif.",
      });
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

        {/* Hak akses dari Role — read-only badges */}
        {rolePermissions.length > 0 && (
          <div className="mb-4 rounded-2xl border border-outline-variant bg-surface-container-low p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-outline">
              Hak akses dari Role
              {initialData?.role?.name ? ` — ${initialData.role.name}` : ""} (
              {rolePermissions.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {rolePermissions.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-lowest px-2.5 py-1 text-xs font-medium text-on-surface-variant"
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-outline">
          Hak akses tambahan ({additionalPermissions.length})
        </p>

        {/* Tercentang summary — grouped badges */}
        {selectedPermissions.length > 0 && (
          <div className="mb-4 rounded-2xl border border-primary/20 bg-primary-container/10 p-4">
            <p className="mb-2 text-xs font-medium text-primary">
              Tercentang ({selectedPermissions.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedPermissions.map((p) => {
                const g = groupOf.get(p.name);
                return (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-container/20 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {g && (
                      <span className="text-[10px] font-semibold opacity-60">
                        {g}
                      </span>
                    )}
                    {p.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Catalog states */}
        {catalogLoading ? (
          <div className="flex w-full items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
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
          <p className="rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            Tidak ada permission yang tersedia.
          </p>
        ) : (
          <>
            <Search
              value={search}
              onChange={setSearch}
              placeholder="Cari permission..."
              className="mb-3"
            />

            {/* Global toggle */}
            <div className="mb-3 overflow-hidden rounded-2xl border border-outline-variant">
              <button
                type="button"
                onClick={toggleAllGlobal}
                className="flex w-full items-center justify-between gap-2 bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
              >
                <span>
                  Pilih Semua ({selectedIds.length}/
                  {additionalPermissions.length})
                </span>
                <span className="text-xs font-medium text-primary">
                  {allAdditionalSelected ? "Batal Semua" : "Pilih Semua"}
                </span>
              </button>
            </div>

            {/* Search results — flat list with group labels */}
            {query ? (
              <div className="overflow-hidden rounded-2xl border border-outline-variant">
                {filteredPermissions.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-on-surface-variant">
                    Tidak ada permission yang cocok dengan pencarian.
                  </p>
                ) : (
                  <div className="max-h-[400px] divide-y divide-outline-variant overflow-y-auto">
                    {filteredPermissions.map((perm) => {
                      const checked = selectedIds.includes(perm.id);
                      const g = groupOf.get(perm.name);
                      return (
                        <label
                          key={perm.id}
                          className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-container-low"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(perm.id)}
                            disabled={saving}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-outline text-primary focus:ring-primary-container"
                          />
                          <div className="min-w-0">
                            <span className="block text-sm font-medium text-on-surface">
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
                        </label>
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
                  const allSel =
                    g.perms.length > 0 &&
                    g.perms.every((p) => selectedIds.includes(p.id));
                  return (
                    <div
                      key={g.label}
                      className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest"
                    >
                      {/* Group header */}
                      <button
                        type="button"
                        onClick={() => toggleGroup(g.label)}
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
                              {selCount} terpilih
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
                          {/* Per-group toggle */}
                          <div className="mb-1 px-2">
                            <button
                              type="button"
                              onClick={() => toggleAllGroup(g.label)}
                              className="text-xs font-medium text-primary transition-colors hover:text-on-surface hover:underline"
                            >
                              {allSel ? "Batal pilih semua" : "Pilih semua"}
                            </button>
                          </div>

                          {g.perms.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-on-surface-variant">
                              Tidak ada permission di grup ini.
                            </p>
                          ) : (
                            <div className="space-y-0.5">
                              {g.perms.map((p) => {
                                const checked = selectedIds.includes(p.id);
                                return (
                                  <label
                                    key={p.id}
                                    className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-surface-container-low"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => togglePermission(p.id)}
                                      disabled={saving}
                                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-outline text-primary focus:ring-primary-container"
                                    />
                                    <div className="min-w-0">
                                      <span className="block text-sm font-medium text-on-surface">
                                        {p.name}
                                      </span>
                                      {p.description && (
                                        <span className="block text-xs text-on-surface-variant">
                                          {p.description}
                                        </span>
                                      )}
                                    </div>
                                  </label>
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