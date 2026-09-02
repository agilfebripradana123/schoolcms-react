import { useEffect, useState } from "react";
import { Loader2, Calendar, Bell, AlertTriangle, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { toApiError } from "@/lib/api/error";

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
        <p className="mt-2 text-sm text-red-700">Gagal memuat data: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
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

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Profil
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {profile ? "Tersedia" : "-"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Tagihan
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {formatRupiah(totals?.total_billed)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Dibayar
          </p>
          <p className="mt-1 text-lg font-bold text-emerald-600">
            {formatRupiah(totals?.total_paid)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Sisa
          </p>
          <p className="mt-1 text-lg font-bold text-rose-600">
            {formatRupiah(totals?.total_outstanding)}
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <Calendar className="h-6 w-6 text-primary" />
          <p className="mt-2 text-sm font-semibold text-slate-900">Akademik</p>
          <p className="text-xs text-slate-500">Nilai, jadwal, kehadiran</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <Bell className="h-6 w-6 text-primary" />
          <p className="mt-2 text-sm font-semibold text-slate-900">Notifikasi</p>
          <p className="text-xs text-slate-500">Pemberitahuan sekolah</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <CheckCircle className="h-6 w-6 text-primary" />
          <p className="mt-2 text-sm font-semibold text-slate-900">Keuangan</p>
          <p className="text-xs text-slate-500">Tagihan & pembayaran</p>
        </div>
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