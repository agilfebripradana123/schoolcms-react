import { Mail, User as UserIcon, AtSign, Shield, Calendar } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import Card, { CardBody } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";

interface InfoRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-900">
          {value || "Belum tersedia"}
        </p>
      </div>
    </div>
  );
}

export default function TeacherProfilePage() {
  const { user } = useAuth();

  const roleLabel = user?.role ? String(user.role) : "";

  return (
    <PageContainer>
      <PageHeader
        title="Profil Saya"
        description="Informasi identitas akun Portal Guru"
      />

      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {user?.photo ? (
              <img
                src={user.photo}
                alt={user.name}
                className="h-16 w-16 shrink-0 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                <span className="text-2xl font-bold">
                  {(user?.name || "G").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900">{user?.name || "Guru"}</h2>
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
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h3 className="text-sm font-semibold text-slate-700">Data Guru</h3>
          <p className="mt-1 text-sm text-slate-500">
            Informasi spesifik guru (NIP, NUPTK, telepon, jenis kelamin, tempat & tanggal lahir,
            alamat, status kepegawaian, jabatan, mata pelajaran).
          </p>
          <div className="mt-4 p-12 text-center">
            <Calendar className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-500">Data guru belum tersedia</p>
            <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
              Backend belum memiliki endpoint profil guru yang terikat identity login (self-service).
              Menampilkannya dari daftar seluruh guru atau berdasarkan parameter yang dapat dimanipulasi
              bukanlah sumber data yang aman bagi role Guru.
            </p>
          </div>
        </CardBody>
      </Card>
    </PageContainer>
  );
}
