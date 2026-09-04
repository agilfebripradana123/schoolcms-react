import { useCallback, useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { teacherClassService } from "@/features/academic";
import type { TeacherClassStudent } from "@/features/academic";
import { toApiError } from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import Search from "@/components/ui/Search";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Pagination from "../../../components/ui/Pagination";

interface NavState {
  className?: string;
}

export default function TeacherClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const className = (location.state as NavState | null)?.className;

  const [students, setStudents] = useState<TeacherClassStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{
    current_page: number;
    last_page: number;
    total: number;
  } | null>(null);

  const load = useCallback(
    (pageNum: number, q: string) => {
      setLoading(true);
      setError(null);
      teacherClassService
        .listStudents(id ?? "", { page: pageNum, per_page: 20, q: q || undefined })
        .then((res) => {
          setStudents(res.data ?? []);
          setMeta(res.meta ?? null);
        })
        .catch((err) => setError(toApiError(err).message))
        .finally(() => setLoading(false));
    },
    [id],
  );

  useEffect(() => {
    load(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  return (
    <PageContainer className="py-6">
      <PageHeader
        title={`Siswa Kelas ${className ?? id}`}
        description="Daftar siswa pada kelas yang menjadi scope mengajar Anda."
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <form onSubmit={handleSearch}>
              <Search
                value={search}
                onChange={setSearch}
                placeholder="Cari nama / NIS / NISN"
              />
            </form>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-on-surface-variant">
              {meta ? `${meta.total} siswa aktif` : ""}
            </span>
          </div>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">{error}</p>
            <Button variant="secondary" size="sm" onClick={() => load(page, search)}>
              Muat Ulang
            </Button>
          </div>
        ) : (
            <DataTable<TeacherClassStudent>
              loading={loading}
              emptyMessage={search ? "Tidak ada siswa yang cocok" : "Belum ada siswa di kelas ini"}
              columns={[
                {
                  header: "No",
                  accessor: "id",
                  render: (_v, row) => {
                    const index = students.findIndex((s) => s.id === row.id);
                    return (meta?.current_page && page ? (page - 1) * 20 : 0) + index + 1;
                  },
                },
                {
                  header: "Nama",
                  accessor: "id",
                  render: (_v, row) => (
                    <span className="font-semibold text-on-surface">
                      {row.student?.name ?? "-"}
                    </span>
                  ),
                },
                {
                  header: "NIS",
                  accessor: "id",
                  render: (_v, row) => row.student?.nis ?? "-",
                },
                {
                  header: "NISN",
                  accessor: "id",
                  render: (_v, row) => row.student?.nisn ?? "-",
                },
                {
                  header: "Jenis Kelamin",
                  accessor: "id",
                  render: (_v, row) =>
                    row.student?.gender === "L" ? "Laki-laki" : row.student?.gender === "P" ? "Perempuan" : "-",
                },
                {
                  header: "Status",
                  accessor: "status",
                  render: (value) => {
                    const status = String(value);
                    const variant =
                      status === "active" ? "success" : status === "moved" ? "warning" : "neutral";
                    return <Badge variant={variant as "success" | "warning" | "neutral"}>{status}</Badge>;
                  },
                },
              ]}
              data={students}
            />
        )}
        {meta && (
          <Pagination
            meta={{ current_page: meta.current_page, last_page: meta.last_page, per_page: 20, total: meta.total }}
            onPageChange={(n) => { setPage(n); load(n, search); }}
            loading={loading}
            error={error}
          />
        )}
      </Card>
    </PageContainer>
  );
}
