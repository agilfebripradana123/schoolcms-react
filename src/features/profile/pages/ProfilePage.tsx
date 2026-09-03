import { useState } from "react";
import { Save, KeyRound, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FormField, Input } from "@/components/ui/Form";
import PageContainer from "@/components/layout/PageContainer";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { useAuth } from "@/features/auth/useAuth";
import { profileService } from "../api/profile.service";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  // ---- Profile info form (synced from authenticated user) ----
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  // ---- Password form ----
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileError, setProfileError] = useState<ApiError | null>(null);
  const [profileFieldErrors, setProfileFieldErrors] = useState<Record<string, string[]>>({});
  const [passwordError, setPasswordError] = useState<ApiError | null>(null);
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string[]>>({});

  if (!user) {
    return (
      <PageContainer className="py-6">
        <Card>
          <p className="text-sm text-on-surface-variant">Memuat profil...</p>
        </Card>
      </PageContainer>
    );
  }

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("") || user.email?.charAt(0).toUpperCase() || "U";

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    setProfileFieldErrors({});

    try {
      const res = await profileService.updateProfile({
        name: name.trim(),
        username: username.trim() || null,
        email: email.trim(),
      });
      // Update auth context + persisted user so header reflects changes.
      updateUser(res.user);
      toast.success("Profil berhasil diperbarui.");
    } catch (err) {
      const apiError = toApiError(err);
      setProfileError(apiError);
      if (apiError.errors) setProfileFieldErrors(apiError.errors);
      toast.error("Gagal memperbarui profil", { description: apiError.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordError(null);
    setPasswordFieldErrors({});

    if (newPassword !== confirmPassword) {
      setPasswordError({
        message: "Konfirmasi password tidak cocok dengan password baru.",
        errors: { password_confirmation: ["Konfirmasi password harus sama dengan password baru."] },
      });
      setSavingPassword(false);
      return;
    }

    try {
      await profileService.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      toast.success("Password berhasil diubah.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const apiError = toApiError(err);
      setPasswordError(apiError);
      if (apiError.errors) setPasswordFieldErrors(apiError.errors);
      toast.error("Gagal mengubah password", { description: apiError.message });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <PageContainer className="py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
          Profil
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Kelola informasi profil dan keamanan akun Anda.
        </p>
      </div>

      <div className="space-y-6">
        {/* ---- Informasi Profil ---- */}
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-on-surface">
            Informasi Profil
          </h2>

          {/* Avatar */}
          <div className="mb-6 flex items-center gap-4">
            {user.photo ? (
              <img
                src={user.photo}
                alt={user.name}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-200"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-xl font-bold text-on-primary">
                {initials}
              </div>
            )}
            <div>
              <p className="font-medium text-on-surface">{user.name}</p>
              <p className="text-xs text-on-surface-variant">
                {user.email}
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-5" noValidate>
            <FormField label="Nama" error={profileFieldErrors.name?.[0]}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap"
                disabled={savingProfile}
              />
            </FormField>

            <FormField label="Username" error={profileFieldErrors.username?.[0]}>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nama pengguna"
                disabled={savingProfile}
              />
            </FormField>

            <FormField label="Email" error={profileFieldErrors.email?.[0]}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@sekolah.sch.id"
                disabled={savingProfile}
              />
            </FormField>

            {profileError && !profileError.errors && (
              <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
                {profileError.message}
              </p>
            )}

            <div className="flex justify-end">
              <Button type="submit" loading={savingProfile} leftIcon={<Save className="h-4 w-4" />}>
                {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </Card>

        {/* ---- Ubah Password ---- */}
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-on-surface">
            Ubah Password
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-5" noValidate>
            <FormField
              label="Password Saat Ini"
              error={passwordFieldErrors.current_password?.[0]}
            >
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Password saat ini"
                disabled={savingPassword}
                autoComplete="current-password"
              />
            </FormField>

            <FormField label="Password Baru" error={passwordFieldErrors.password?.[0]}>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                disabled={savingPassword}
                autoComplete="new-password"
              />
            </FormField>

            <FormField
              label="Konfirmasi"
              error={passwordFieldErrors.password_confirmation?.[0]}
            >
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                disabled={savingPassword}
                autoComplete="new-password"
              />
            </FormField>

            {passwordError && !passwordError.errors && (
              <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
                {passwordError.message}
              </p>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="secondary"
                loading={savingPassword}
                leftIcon={<KeyRound className="h-4 w-4" />}
              >
                {savingPassword ? "Mengubah Password..." : "Ubah Password"}
              </Button>
            </div>
          </form>
        </Card>

        {/* ---- Informasi Akun ---- */}
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-on-surface">
            Informasi Akun
          </h2>
          <dl className="divide-y divide-slate-100">
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-on-surface-variant">Role</dt>
              <dd className="font-medium text-on-surface">{user.role || "-"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-on-surface-variant">Status</dt>
              <dd>
                {user.is_active === false ? (
                  <Badge variant="danger">Nonaktif</Badge>
                ) : (
                  <Badge variant="success">
                    <CheckCircle2 className="h-3 w-3" /> Aktif
                  </Badge>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-on-surface-variant">Terakhir Login</dt>
              <dd className="text-sm text-on-surface-variant">Belum tersedia</dd>
            </div>
          </dl>
        </Card>
      </div>
    </PageContainer>
  );
}
