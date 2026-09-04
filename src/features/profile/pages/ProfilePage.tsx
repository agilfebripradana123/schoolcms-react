import { useEffect, useRef, useState } from "react";
import { Loader2, Shield, Camera } from "lucide-react";
import { api } from "@/lib/api";
import { PROFILE } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/useAuth";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";

interface ProfileData {
  id: number;
  name: string;
  username: string | null;
  email: string;
  photo: string | null;
  role: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface PasswordForm {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get<{ success: boolean; data: ProfileData }>(PROFILE.PROFILE);
      setProfile(res.data);
    } catch (err) {
      const msg = toApiError(err).message;
      toast.error("Gagal memuat profil", { description: msg });
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get<{ success: boolean; data: ProfileData }>(PROFILE.PROFILE);
        if (active) setProfile(res.data);
      } catch (err) {
        if (active) {
          const msg = toApiError(err).message;
          toast.error("Gagal memuat profil", { description: msg });
          setError(msg);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const preview = URL.createObjectURL(f);
    setPreviewUrl(preview);
    setImgFailed(false);
    const fd = new FormData();
    fd.append("photo", f);
    setPhotoSaving(true);
    try {
      await api.post("/profile/photo" as never, fd, { headers: { "Content-Type": undefined } } as never);
      await load();
      toast.success("Foto diperbarui");
      // sync header: reload user photo from profile
      try {
        const r = await api.get<{ success: boolean; data: ProfileData }>(PROFILE.PROFILE);
        if (r.data?.photo) updateUser({ photo: r.data.photo });
      } catch {}
    } catch (err) {
      toast.error("Gagal upload foto", { description: toApiError(err).message });
    } finally {
      setPhotoSaving(false);
      if (fileRef.current) fileRef.current.value = "";
      URL.revokeObjectURL(preview);
      setPreviewUrl(null);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.password_confirmation) {
      toast.error("Password baru tidak cocok");
      return;
    }
    if (passwordForm.password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    setSaving(true);
    try {
      await api.put(PROFILE.PASSWORD, {
        current_password: passwordForm.current_password,
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation,
      });
      toast.success("Password berhasil diubah");
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
      setShowPasswordForm(false);
    } catch (err) {
      const msg = toApiError(err).message;
      toast.error("Gagal mengubah password", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Card>
          <div className="p-6 text-sm text-error">{error}</div>
        </Card>
      </PageContainer>
    );
  }

  const displayPhoto = previewUrl ?? profile?.photo ?? user?.photo ?? null;

  return (
    <PageContainer>
      <PageHeader title="Profil Saya" description="Kelola informasi profil Anda" />

      <Card className="mb-6">
        <div className="flex flex-col items-center gap-4 p-2">
          {previewUrl ? (
            <img src={previewUrl} alt={profile?.name ?? "foto"} className="h-32 w-32 rounded-2xl object-cover border" />
          ) : displayPhoto && !imgFailed ? (
            <img src={displayPhoto} alt={profile?.name ?? "foto"} className="h-32 w-32 rounded-2xl object-cover border" onError={() => setImgFailed(true)} />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-slate-100 border border-dashed">
              <Camera className="h-10 w-10 text-slate-400" />
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={photoSaving}>
            {photoSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</> : <><Camera className="h-4 w-4" /> Ubah Foto</>}
          </Button>
          <p className="text-xs text-on-surface-variant">JPG/PNG/WEBP, maks 2 MB</p>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-on-surface-variant">Informasi Akun</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div><dt className="text-xs text-on-surface-variant">Nama Lengkap</dt><dd className="mt-1 font-medium text-on-surface">{profile?.name ?? "—"}</dd></div>
          <div><dt className="text-xs text-on-surface-variant">Username</dt><dd className="mt-1 font-medium text-on-surface">{profile?.username ?? "—"}</dd></div>
          <div><dt className="text-xs text-on-surface-variant">Email</dt><dd className="mt-1 font-medium text-on-surface break-words">{profile?.email ?? "—"}</dd></div>
          <div><dt className="text-xs text-on-surface-variant">Role</dt><dd className="mt-1 font-medium text-on-surface inline-flex items-center gap-1"><Shield className="h-4 w-4 text-primary" />{profile?.role ?? "—"}</dd></div>
        </dl>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">Keamanan</h2>
          {!showPasswordForm && (
            <Button variant="ghost" size="sm" onClick={() => setShowPasswordForm(true)}>Ubah Password</Button>
          )}
        </div>
        {showPasswordForm ? (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <FormField label="Password Saat Ini" required>
              <Input type="password" required value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} placeholder="Masukkan password saat ini" />
            </FormField>
            <FormField label="Password Baru" required>
              <Input type="password" required minLength={6} value={passwordForm.password} onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })} placeholder="Minimal 6 karakter" />
            </FormField>
            <FormField label="Konfirmasi Password Baru" required>
              <Input type="password" required minLength={6} value={passwordForm.password_confirmation} onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })} placeholder="Ulangi password baru" />
            </FormField>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Simpan</Button>
              <Button type="button" variant="ghost" onClick={() => { setShowPasswordForm(false); setPasswordForm({ current_password: "", password: "", password_confirmation: "" }); }}>Batal</Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-on-surface-variant">Terakhir diperbarui: {profile?.updated_at ? new Date(profile.updated_at).toLocaleString("id-ID") : "—"}</p>
        )}
      </Card>
    </PageContainer>
  );
}
