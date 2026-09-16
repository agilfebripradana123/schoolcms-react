import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";
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

interface CalendarEvent {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  description?: string | null;
}

const activeYearOptions: SelectOption<string>[] = [
  { value: "2024/2025", label: "2024/2025" },
  { value: "2025/2026", label: "2025/2026" },
];

export default function TeacherCalendarsPage() {
  const [calendars, setCalendars] = useState<CalendarEvent[]>([]);
  const [filtered, setFiltered] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeYear, setActiveYear] = useState<string | null>(null);
  const [query, setQuery] = useState<{ search: string; activeYear: string | null }>({ search: "", activeYear: null });

  const searchTimeout = useRef<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: CalendarEvent[] }>("/teacher/calendars", { params: { search: query.search || undefined, activeYear: query.activeYear || undefined } })
      .then((res) => {
        const data = res.data.data ?? [];
        setCalendars(data);
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

  const handleActiveYearChange = useCallback((value: string | null) => {
    setActiveYear(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, activeYear: value }));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Kalender Akademik" description="Jadwal kegiatan sekolah." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Kalender Akademik" description="Jadwal kegiatan sekolah." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (calendars.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Kalender Akademik" description="Jadwal kegiatan sekolah." />
        <PortalEmptyState icon={<Calendar />} description="Belum ada kalender akademik." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Kalender Akademik" description="Jadwal kegiatan sekolah." />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari nama atau deskripsi kegiatan..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Tahun</span>
              <AppSelect options={activeYearOptions} value={activeYear} onChange={handleActiveYearChange} placeholder="Pilih Tahun" isSearchable={false} className="min-w-[180px]" />
            </label>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "name" as keyof CalendarEvent, header: "Nama", render: (_val, c) => c.name },
              { 
                accessor: "start_date" as keyof CalendarEvent, 
                header: "Tanggal Mulai", 
                render: (_val, c) => new Date(c.start_date).toLocaleDateString("id-ID") 
              },
              { 
                accessor: "end_date" as keyof CalendarEvent, 
                header: "Tanggal Selesai", 
                render: (_val, c) => new Date(c.end_date).toLocaleDateString("id-ID") 
              },
              { 
                accessor: "description" as keyof CalendarEvent, 
                header: "Deskripsi", 
                render: (_val, c) => c.description ?? "—" 
              },
            ]}
            data={filtered}
          />
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((c) => (
            <Card key={c.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <p className="font-semibold text-primary">{c.name}</p>
                <p className="text-sm text-secondary">
                  {new Date(c.start_date).toLocaleDateString("id-ID")} - {new Date(c.end_date).toLocaleDateString("id-ID")}
                </p>
                {c.description && <p className="text-sm text-secondary">{c.description}</p>}
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && calendars.length > 0 && (
          <PortalEmptyState icon={<Calendar />} description="Tidak ada kalender yang sesuai dengan pencarian." />
        )}
      </Card>
    </PageContainer>
  );
}
