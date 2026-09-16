import { useCallback, useEffect, useRef, useState } from "react";
import { FileText } from "lucide-react";
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

interface Question {
  id: number;
  question: string;
  type: string;
  subject_name: string;
}

const tipeOptions: SelectOption<string>[] = [
  { value: "pilihan ganda", label: "Pilihan Ganda" },
  { value: "esai", label: "Esai" },
  { value: "uraian", label: "Uraian" },
];

export default function TeacherQuestionsPage() {
  const [data, setData] = useState<Question[]>([]);
  const [filtered, setFiltered] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tipe, setTipe] = useState<string | null>(null);
  const [query, setQuery] = useState<{ search: string; tipe: string | null }>({ search: "", tipe: null });

  const searchTimeout = useRef<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ data: Question[] }>("/teacher/exams/questions", { params: { search: query.search || undefined, tipe: query.tipe || undefined } })
      .then((res) => {
        const items = res.data.data ?? [];
        setData(items);
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

  const handleTipeChange = useCallback((value: string | null) => {
    setTipe(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, tipe: value }));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Bank Soal" description="Daftar soal ujian." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Bank Soal" description="Daftar soal ujian." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (data.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Bank Soal" description="Daftar soal ujian." />
        <PortalEmptyState icon={<FileText />} description="Belum ada data soal." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Bank Soal" description="Daftar soal ujian." />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari pertanyaan, tipe, mata pelajaran..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Tipe Soal</span>
              <AppSelect options={tipeOptions} value={tipe} onChange={handleTipeChange} placeholder="Pilih Tipe Soal" isSearchable={false} className="min-w-[180px]" />
            </label>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <DataTable
            columns={[
              { accessor: "question" as keyof Question, header: "Pertanyaan", render: (_val, row) => row.question },
              { accessor: "type" as keyof Question, header: "Tipe", render: (_val, row) => row.type },
              { accessor: "subject_name" as keyof Question, header: "Mata Pelajaran", render: (_val, row) => row.subject_name },
            ]}
            data={filtered}
          />
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((d) => (
            <Card key={d.id} className="p-4 rounded-2xl border border-outline-variant">
              <div className="space-y-2">
                <p className="font-semibold text-primary">{d.question}</p>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <span>{d.type}</span>
                  <span>•</span>
                  <span>{d.subject_name}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && data.length > 0 && (
          <PortalEmptyState icon={<FileText />} description="Tidak ada soal yang sesuai dengan pencarian." />
        )}
      </Card>
    </PageContainer>
  );
}