import { useEffect, useState } from "react";
import { Loader2, Shield, Camera } from "lucide-react";
import { api } from "@/lib/api";
import { PROFILE } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";
import { toast } from "sonner";

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
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
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
    }

    load();
    return () => {
      active = false;
    };
  }, []);

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
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-600">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola informasi profil Anda</p>
      </div>

      {/* Foto Profil */}
      {profile?.photo ? (
        <section className="text-center">
          <img
            src={profile.photo}
            alt={profile.name}
            className="mx-auto mb-4 h-32 w-32 rounded-2xl object-cover"
          />
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-200">
            <Camera className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-sm text-slate-400">Belum ada foto profil</p>
        </section>
      )}

      {/* Informasi Profil */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Informasi Akun
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Nama Lengkap</dt>
            <dd className="font-semibold text-slate-900">{profile?.name ?? "Tidak tersedia"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Username</dt>
            <dd className="font-semibold text-slate-900">{profile?.username ?? "Tidak tersedia"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-semibold text-slate-900">{profile?.email ?? "Tidak tersedia"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Role</dt>
            <dd className="font-semibold text-slate-900">
              <span className="inline-flex items-center gap-1">
                <Shield className="h-4 w-4 text-indigo-500" />
                {profile?.role ?? "Tidak tersedia"}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      {/* Ubah Password */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Keamanan
          </h2>
          {!showPasswordForm && (
            <button
              type="button"
              onClick={() => setShowPasswordForm(true)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Ubah Password
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password Saat Ini
              </label>
              <input
                type="password"
                required
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, current_password: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password Baru</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, password: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.password_confirmation}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Simpan
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordForm({
                    current_password: "",
                    password: "",
                    password_confirmation: "",
                  });
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        {!showPasswordForm && (
          <p className="mt-3 text-sm text-slate-500">
            Terakhir diperbarui: {profile?.updated_at ?? "-"}
          </p>
        )}
      </section>
    </div>
  );
}
