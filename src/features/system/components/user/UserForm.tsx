import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { roleService } from "../../api/role.service";
import { userManagementService } from "../../api/user.service";
import type {
  CreateUserPayload,
  Role,
  UpdateUserPayload,
  UserManagement,
} from "../../api/types";

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: (saved: UserManagement) => void;
  initialData?: UserManagement | null;
}

export default function UserForm({
  open,
  onClose,
  onSaved,
  initialData,
}: UserFormProps) {
  const isEdit = Boolean(initialData);

  const [roleId, setRoleId] = useState<string>("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const loadRoles = useCallback(() => {
    roleService
      .list({ per_page: 100 })
      .then((res) => {
        setRoles(res.data);
        setRolesError(false);
      })
      .catch(() => {
        setRolesError(true);
      })
      .finally(() => {
        setRolesLoading(false);
      });
  }, []);

  const [previousOpen, setPreviousOpen] = useState(open);
  const [previousInitialData, setPreviousInitialData] = useState(initialData);

  if (open !== previousOpen || initialData !== previousInitialData) {
    setPreviousOpen(open);
    setPreviousInitialData(initialData);

    if (open) {
      setError(null);
      setFieldErrors({});
      setRolesLoading(true);
      setRolesError(false);

      if (initialData) {
        setRoleId(String(initialData.role_id));
        setName(initialData.name);
        setUsername(initialData.username ?? "");
        setEmail(initialData.email);
        setPassword("");
        setIsActive(initialData.is_active ?? true);
      } else {
        setRoleId("");
        setName("");
        setUsername("");
        setEmail("");
        setPassword("");
        setIsActive(true);
      }
    }
  }

  useEffect(() => {
    if (open) {
      loadRoles();
    }
  }, [open, loadRoles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    if (!roleId) {
      setError({ message: "Silakan pilih role." });
      setSubmitting(false);
      return;
    }

    if (!isEdit && !password) {
      setError({ message: "Password wajib diisi." });
      setSubmitting(false);
      return;
    }

    const basePayload: CreateUserPayload = {
      role_id: Number(roleId),
      name,
      username: username.trim() || null,
      email,
      password,
      is_active: isActive,
    };

    const payload: CreateUserPayload | UpdateUserPayload = isEdit
      ? {
          role_id: Number(roleId),
          name,
          username: username.trim() || null,
          email,
          is_active: isActive,
          ...(password ? { password } : {}),
        }
      : basePayload;

    try {
      if (initialData) {
        await userManagementService.update(initialData.id, payload);
        toast.success("Pengguna berhasil diperbarui.");
        onSaved({
          ...initialData,
          role_id: Number(roleId),
          name,
          username: username.trim() || null,
          email,
          is_active: isActive,
        });
      } else {
        const res = await userManagementService.create(payload as CreateUserPayload);
        toast.success("Pengguna berhasil ditambahkan.");
        onSaved(res.data);
      }
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan pengguna", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const roleOptions = roles.map((r) => ({ value: String(r.id), label: r.name }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Pengguna" : "Tambah Pengguna"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="user-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
        <FormField
          label="Role"
          required
          error={fieldErrors.role_id?.[0] ?? (error && !roleId ? error.message : undefined)}
        >
          {rolesLoading ? (
            <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Memuat role...
            </div>
          ) : rolesError ? (
            <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
              <span>Gagal memuat role.</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setRolesLoading(true);
                  setRolesError(false);
                  loadRoles();
                }}
                className="self-start"
              >
                Muat Ulang
              </Button>
            </div>
          ) : roles.length === 0 ? (
            <div className="flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
              <span>Tidak ada role tersedia.</span>
              <span className="text-xs">
                Tambahkan role terlebih dahulu melalui menu Peran.
              </span>
            </div>
          ) : (
            <AppSelect
              value={roleId}
              onChange={(v) => setRoleId(v ?? "")}
              options={roleOptions}
              placeholder="Pilih Role"
              isDisabled={submitting}
            />
          )}
        </FormField>

        <FormField label="Nama" required error={fieldErrors.name?.[0]}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama lengkap"
            disabled={submitting}
          />
        </FormField>

        <FormField label="Username" error={fieldErrors.username?.[0]}>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nama pengguna (opsional)"
            disabled={submitting}
          />
        </FormField>

        <FormField label="Email" required error={fieldErrors.email?.[0]}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@sekolah.sch.id"
            disabled={submitting}
          />
        </FormField>

        <FormField
          label={isEdit ? "Password (kosongkan jika tidak diubah)" : "Password"}
          required={!isEdit}
          error={fieldErrors.password?.[0]}
        >
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEdit ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"}
            disabled={submitting}
            autoComplete="new-password"
          />
        </FormField>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={submitting}
            className="h-4 w-4 rounded border-slate-300 text-primary-container focus:ring-primary-container"
          />
          <div>
            <span className="block text-sm font-semibold text-on-surface">
              Akun aktif
            </span>
            <span className="block text-xs text-on-surface-variant">
              Nonaktifkan untuk menonaktifkan akses pengguna ini.
            </span>
          </div>
        </label>

        {error && !error.errors && roleId && (isEdit || password) && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}
