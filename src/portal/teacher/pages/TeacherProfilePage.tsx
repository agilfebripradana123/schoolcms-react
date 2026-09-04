import { Mail, User as UserIcon, AtSign, Shield } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import TeacherEmptyData from "@/portal/teacher/components/TeacherEmptyData";

interface InfoRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-fixed/15 text-on-primary-fixed">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-outline">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-on-surface">
          {value || "Belum tersedia"}
        </p>
      </div>
    </div>
  );
}

/**
 * Profil Guru — READ-ONLY.
 * Hanya menampilkan identitas akun dari konteks autentikasi (identity-derived,
 * aman untuk role Guru, tanpa request tambahan).
 *
 * Data spesifik guru (NIP, NUPTK, telepon, jenis kelamin, tempat/tanggal lahir,
 * alamat, status kepegawaian, dst.) tidak dapat diambil secara identity-derived
 * karena backend belum memiliki endpoint self-service guru (mis. GET /api/teacher/me).
 */
export default function TeacherProfilePage() {
  const { user } = useAuth();

  const roleLabel = user?.role ? String(user.role) : "";

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Profil Saya"
        description="Informasi identitas akun Portal Guru"
      />

      {/* Identitas Akun (dari useAuth / /api/me) */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {user?.photo ? (
            <img
              src={user.photo}
              alt={user.name}
              className="h-16 w-16 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-on-primary-fixed">
              <span className="text-2xl font-bold">
                {(user?.name || "G").charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-on-surface">{user?.name || "Guru"}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="primary">Portal Guru</Badge>
              {roleLabel && <Badge variant="secondary">{roleLabel}</Badge>}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <InfoRow icon={UserIcon} label="Nama" value={user?.name} />
          <InfoRow icon={AtSign} label="Username" value={user?.username} />
          <InfoRow icon={Mail} label="Email" value={user?.email} />
          <InfoRow icon={Shield} label="Role" value={roleLabel} />
        </div>
      </Card>

      {/* Data Guru — menunggu API self-service yang identity-derived */}
      <Card>
        <h3 className="font-display text-base font-semibold text-on-surface">Data Guru</h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Informasi spesifik guru (NIP, NUPTK, telepon, jenis kelamin, tempat & tanggal lahir,
          alamat, status kepegawaian, jabatan, mata pelajaran).
        </p>
        <div className="mt-4">
          <TeacherEmptyData
            title="Data guru belum tersedia"
            description="Backend belum memiliki endpoint profil guru yang terikat identity login (self-service).
            Menampilkannya dari daftar seluruh guru atau berdasarkan parameter yang dapat dimanipulasi
            bukanlah sumber data yang aman bagi role Guru."
          />
        </div>
      </Card>
    </PageContainer>
  );
}
