import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import apiClient from "@/lib/api/axios";
import { toApiError } from "@/lib/api";
import Card from "@/components/ui/Card";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import AppSelect from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";

interface Announcement {
  id: number;
  title: string;
  date: string;
  content: string;
  category?: string | null;
}

const kategoriOptions: SelectOption<string>[] = [
  { value: "umum", label: "Umum" },
  { value: "guru", label: "Guru" },
];

export default function TeacherAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filtered, setFiltered] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState<string | null>(null);
  const [query, setQuery] = useState<{ search: string; kategori: string | null }>({ search: "", kategori: null });

  const searchTimeout = useRef<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: Announcement[] }>("/teacher/announcements", { params: { search: query.search || undefined, kategori: query.kategori || undefined } })
      .then((res) => {
        const data = res.data.data ?? [];
        setAnnouncements(data);
        setFiltered(data);
      })
      .catch((err) => setError(toApiError(err).message))
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    searchTimeout.current = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      setQuery((prev) => ({ ...prev, search: value }));
    }, 400);
  }, []);

  const handleKategoriChange = useCallback((value: string | null) => {
    setKategori(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, kategori: value }));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Pengumuman" description="Daftar pengumuman sekolah." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Pengumuman" description="Daftar pengumuman sekolah." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (announcements.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Pengumuman" description="Daftar pengumuman sekolah." />
        <PortalEmptyState icon={<Bell />} description="Belum ada pengumuman." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Pengumuman" description="Daftar pengumuman sekolah." />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari judul atau isi pengumuman..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Kategori</span>
              <AppSelect options={kategoriOptions} value={kategori} onChange={handleKategoriChange} placeholder="Pilih Kategori" isSearchable={false} className="min-w-[180px]" />
            </label>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "title" as keyof Announcement, header: "Judul", render: (_val, a) => a.title },
              { accessor: "date" as keyof Announcement, header: "Tanggal", render: (_val, a) => new Date(a.date).toLocaleDateString("id-ID") },
              { 
                accessor: "content" as keyof Announcement, 
                header: "Isi", 
                render: (_val, a) => a.content.length > 100 ? a.content.substring(0, 100) + "..." : a.content 
              },
            ]}
            data={filtered}
          />
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((a) => (
            <Card key={a.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <p className="font-semibold text-primary">{a.title}</p>
                <p className="text-sm text-secondary">{new Date(a.date).toLocaleDateString("id-ID")}</p>
                <p className="text-sm text-secondary">
                  {a.content.length > 100 ? a.content.substring(0, 100) + "..." : a.content}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && announcements.length > 0 && (
          <PortalEmptyState icon={<Bell />} description="Tidak ada pengumuman yang sesuai dengan pencarian." />
        )}
      </Card>
    </PageContainer>
  );
}
