import { useCallback, useEffect, useRef, useState } from "react";
import { Mail } from "lucide-react";
import apiClient from "@/lib/api/axios";
import { toApiError } from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import AppSelect from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";

interface Letter {
  id: number;
  subject?: string | null;
  origin?: string | null;
  date?: string | null;
  type?: string | null;
}

const jenisOptions: SelectOption<string>[] = [
  { value: "masuk", label: "Masuk" },
  { value: "keluar", label: "Keluar" },
];

export default function TeacherLettersPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [filtered, setFiltered] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [jenis, setJenis] = useState<string | null>(null);
  const [query, setQuery] = useState<{ search: string; jenis: string | null }>({ search: "", jenis: null });

  const searchTimeout = useRef<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: Letter[] }>("/teacher/letters/incoming", { params: { search: query.search || undefined, jenis: query.jenis || undefined } })
      .then((res) => {
        const items = res.data.data ?? [];
        setLetters(items);
        setFiltered(items);
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

  const handleJenisChange = useCallback((value: string | null) => {
    setJenis(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, jenis: value }));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Surat" description="Daftar surat masuk untuk Portal Guru." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Surat" description="Daftar surat masuk untuk Portal Guru." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (letters.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Surat" description="Daftar surat masuk untuk Portal Guru." />
        <PortalEmptyState icon={<Mail />} description="Belum ada data surat masuk." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Surat" description="Daftar surat masuk untuk Portal Guru." />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari perihal atau asal surat..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Jenis</span>
              <AppSelect options={jenisOptions} value={jenis} onChange={handleJenisChange} placeholder="Pilih Jenis" isSearchable={false} className="min-w-[180px]" />
            </label>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "subject" as keyof Letter, header: "Perihal", render: (_val, l) => l.subject ?? "—" },
              { accessor: "origin" as keyof Letter, header: "Asal Surat", render: (_val, l) => l.origin ?? "—" },
              { accessor: "date" as keyof Letter, header: "Tanggal", render: (_val, l) => l.date ?? "—" },
              {
                accessor: "type" as keyof Letter,
                header: "Jenis",
                render: (_val, l) =>
                  l.type ? <Badge variant="secondary">{l.type}</Badge> : <span className="text-secondary">—</span>,
              },
            ]}
            data={filtered}
          />
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((l) => (
            <Card key={l.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-primary">{l.subject ?? "—"}</p>
                  {l.type && <Badge variant="secondary">{l.type}</Badge>}
                </div>
                <p className="text-sm text-secondary">Asal: {l.origin ?? "—"}</p>
                <p className="text-sm text-secondary">Tanggal: {l.date ?? "—"}</p>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && letters.length > 0 && (
          <PortalEmptyState icon={<Mail />} description="Tidak ada surat yang sesuai dengan pencarian." />
        )}
      </Card>
    </PageContainer>
  );
}
