import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";

export default function Dashboard() {
  return (
    <PageContainer>
      <PageHeader
        title="Dasbor"
        description="Selamat datang di SchoolCMS"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Jumlah Siswa", value: "—" },
          { label: "Jumlah Guru", value: "—" },
          { label: "Kelas Aktif", value: "—" },
          { label: "Pendapatan", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-900">Aktivitas Terbaru</h3>
          <p className="mt-4 text-sm text-slate-400">
            Belum ada aktivitas terbaru.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-900">Aksi Cepat</h3>
          <p className="mt-4 text-sm text-slate-400">
            Aksi cepat akan tersedia di sini.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
