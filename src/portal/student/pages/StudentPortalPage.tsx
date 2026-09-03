import { useEffect, useState } from "react";
import { Loader2, Calendar, Bell, CheckCircle, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { toApiError } from "@/lib/api/error";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface StudentProfile {
  id: number;
  name: string;
  nis?: string;
  nisn?: string;
  class_id?: number;
  class_name?: string;
  email?: string;
  photo?: string | null;
}

interface FinanceTotals {
  total_billed: number;
  total_paid: number;
  total_outstanding: number;
}

export default function StudentPortalPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [totals, setTotals] = useState<FinanceTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const profileRes = await api.get<{ success: boolean; data: StudentProfile }>(
          "/student/profile",
        );
        if (active) setProfile(profileRes.data);
      } catch (err) {
        const msg = toApiError(err).message;
        if (active) setError(msg);
      }

      try {
        const summaryRes = await api.get<{ success: boolean; data: { totals: FinanceTotals } }>(
          "/student/finance/summary",
        );
        if (active) setTotals(summaryRes.data.totals);
      } catch {
        // optional
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
      <Card className="border-red-200 bg-red-50">
        <CardBody>
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-2 text-sm text-red-700">Gagal memuat data: {error}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white">
            <span className="text-xl font-bold">
              {profile?.name?.charAt(0).toUpperCase() || "S"}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Selamat datang, {profile?.name || "Siswa"} 👋
            </h1>
            <p className="text-sm text-slate-500">
              {profile?.nisn ? `NISN: ${profile.nisn}` : ""}
              {profile?.nis && profile.nisn ? " · " : ""}
              {profile?.nis ? `NIS: ${profile.nis}` : ""}
              {profile?.class_name ? ` · Kelas ${profile.class_name}` : ""}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader title="Tagihan" />
          <CardBody>
            <p className="text-lg font-bold text-slate-900">
              {formatRupiah(totals?.total_billed)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Dibayar" />
          <CardBody>
            <p className="text-lg font-bold text-emerald-600">
              {formatRupiah(totals?.total_paid)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Sisa" />
          <CardBody>
            <p className="text-lg font-bold text-rose-600">
              {formatRupiah(totals?.total_outstanding)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Profil" />
          <CardBody>
            <Badge variant="primary">Tersedia</Badge>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <Calendar className="h-6 w-6 text-indigo-500" />
          <CardHeader title="Akademik" description="Nilai, jadwal, kehadiran" />
        </Card>
        <Card>
          <Bell className="h-6 w-6 text-indigo-500" />
          <CardHeader title="Notifikasi" description="Pemberitahuan sekolah" />
        </Card>
        <Card>
          <CheckCircle className="h-6 w-6 text-indigo-500" />
          <CardHeader title="Keuangan" description="Tagihan & pembayaran" />
        </Card>
      </div>
    </div>
  );
}

function formatRupiah(value?: number): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}