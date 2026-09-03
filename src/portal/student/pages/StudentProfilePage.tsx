import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { toApiError } from "@/lib/api/error";
import { toast } from "sonner";

interface StudentProfileData {
  id: number;
  name: string;
  nis?: string;
  nisn?: string;
  class_id?: number;
  class_name?: string;
  email?: string;
  photo?: string | null;
  phone?: string;
  gender?: string;
  religion?: string;
  birth_place?: string;
  birth_date?: string;
  address?: string;
  previous_school?: string;
}

interface ParentInfo {
  father_name?: string;
  mother_name?: string;
  father_occupation?: string;
  mother_occupation?: string;
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [parent, setParent] = useState<ParentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const profileRes = await api.get<{ success: boolean; data: StudentProfileData }>(
          "/student/profile",
        );
        if (active) setProfile(profileRes.data);
      } catch (err) {
        if (active) {
          const msg = toApiError(err).message;
          toast.error("Gagal memuat profil", { description: msg });
          setError(msg);
        }
      }

      try {
        const parentData = localStorage.getItem("student_parent");
        if (parentData && active) {
          setParent(JSON.parse(parentData));
        }
      } catch {
        // ignore, optional
      }

      if (active) setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

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
        <p className="mt-1 text-sm text-slate-500">Informasi data diri Anda</p>
      </div>

      {/* Foto profil */}
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
            <ShieldCheck className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-sm text-slate-400">Belum ada foto profil</p>
        </section>
      )}

      {/* Identitas Siswa */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Identitas Siswa
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Nama Lengkap</dt>
            <dd className="font-semibold text-slate-900">{profile?.name ?? "Tidak tersedia"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">NIS</dt>
            <dd className="font-semibold text-slate-900">{profile?.nis ?? "Tidak tersedia"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">NISN</dt>
            <dd className="font-semibold text-slate-900">{profile?.nisn ?? "Tidak tersedia"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Jenis Kelamin</dt>
            <dd className="font-semibold text-slate-900">{profile?.gender ?? "Tidak tersedia"}</dd>
          </div>
          {profile?.religion && (
            <div>
              <dt className="text-slate-500">Agama</dt>
              <dd className="font-semibold text-slate-900">{profile.religion}</dd>
            </div>
          )}
          {profile?.birth_place && (
            <div>
              <dt className="text-slate-500">Tempat Lahir</dt>
              <dd className="font-semibold text-slate-900">{profile.birth_place}</dd>
            </div>
          )}
          {profile?.birth_date && (
            <div>
              <dt className="text-slate-500">Tanggal Lahir</dt>
              <dd className="font-semibold text-slate-900">{profile.birth_date}</dd>
            </div>
          )}
          {profile?.address && (
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Alamat</dt>
              <dd className="font-semibold text-slate-900">{profile.address}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Data Akademik */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Data Akademik
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Kelas</dt>
            <dd className="font-semibold text-slate-900">
              {profile?.class_id
                ? `${profile.class_id}${profile.class_name ? ` - ${profile.class_name}` : ""}`
                : "Tidak tersedia"}
            </dd>
          </div>
          {profile?.previous_school && (
            <div>
              <dt className="text-slate-500">Asal Sekolah</dt>
              <dd className="font-semibold text-slate-900">{profile.previous_school}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Kontak */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Kontak
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-semibold text-slate-900">{profile?.email ?? "Tidak tersedia"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">No HP</dt>
            <dd className="font-semibold text-slate-900">{profile?.phone ?? "Tidak tersedia"}</dd>
          </div>
        </dl>
      </section>

      {/* Orang Tua / Wali */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Orang Tua / Wali
        </h2>
        {parent ? (
          <dl className="grid gap-4 sm:grid-cols-2">
            {parent.father_name && (
              <div>
                <dt className="text-slate-500">Nama Ayah</dt>
                <dd className="font-semibold text-slate-900">{parent.father_name}</dd>
              </div>
            )}
            {parent.mother_name && (
              <div>
                <dt className="text-slate-500">Nama Ibu</dt>
                <dd className="font-semibold text-slate-900">{parent.mother_name}</dd>
              </div>
            )}
            {parent.father_occupation && (
              <div>
                <dt className="text-slate-500">Pekerjaan Ayah</dt>
                <dd className="font-semibold text-slate-900">{parent.father_occupation}</dd>
              </div>
            )}
            {parent.mother_occupation && (
              <div>
                <dt className="text-slate-500">Pekerjaan Ibu</dt>
                <dd className="font-semibold text-slate-900">{parent.mother_occupation}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-sm text-slate-400">Data orang tua/wali belum tersedia.</p>
        )}
      </section>
    </div>
  );
}
