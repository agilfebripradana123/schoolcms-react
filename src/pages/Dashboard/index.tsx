import { TrendingUp, TrendingDown } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";

const stats = [
  { label: "Jumlah Siswa", value: "1.284", delta: "+4.2%", up: true },
  { label: "Jumlah Guru", value: "96", delta: "+1.1%", up: true },
  { label: "Kelas Aktif", value: "42", delta: "0%", up: null },
  { label: "Pendapatan", value: "Rp 184 jt", delta: "-2.4%", up: false },
];

export default function Dashboard() {
  return (
    <PageContainer>
      <PageHeader
        title="Dasbor"
        description="Selamat datang kembali. Berikut ringkasan singkat aktivitas hari ini."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-slate-200 bg-surface-container-lowest p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
          >
            <p className="text-sm font-medium text-on-surface-variant">{stat.label}</p>
            <p className="mt-3 font-display text-3xl font-bold tracking-tight text-on-surface">{stat.value}</p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold">
              {stat.up === null ? (
                <span className="text-on-surface-variant">Tidak berubah</span>
              ) : stat.up ? (
                <span className="inline-flex items-center gap-1 text-tertiary">
                  <TrendingUp className="h-3.5 w-3.5" /> {stat.delta}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-error">
                  <TrendingDown className="h-3.5 w-3.5" /> {stat.delta}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-surface-container-lowest p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-on-surface">Aktivitas Terbaru</h3>
            <button className="text-xs font-semibold text-primary-container hover:text-primary">Lihat semua</button>
          </div>
          <div className="mt-6 space-y-4 text-sm text-on-surface-variant">
            {[
              "Penerimaan siswa baru dibuka untuk tahun ajaran 2026/2027.",
              "Jadwal ujian tengah semester telah diterbitkan.",
              "Pembaruan struktur biaya SPP berlaku mulai bulan depan.",
            ].map((text) => (
              <div key={text} className="flex items-start gap-3 rounded-2xl bg-surface-container-low p-4">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-container" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-surface-container-lowest p-6">
          <h3 className="font-display text-base font-semibold text-on-surface">Aksi Cepat</h3>
          <div className="mt-4 grid gap-3">
            {[
              "Tambah siswa",
              "Buat pengumuman",
              "Generate rapor",
            ].map((action) => (
              <button
                key={action}
                type="button"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-on-surface shadow-sm transition-colors hover:border-primary-container hover:text-primary-container"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
