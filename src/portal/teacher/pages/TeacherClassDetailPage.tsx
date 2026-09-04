import { useCallback, useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { teacherClassService } from "@/features/academic";
import type { TeacherClassStudent } from "@/features/academic";
import { toApiError } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PortalErrorState from "@/portal/components/PortalErrorState";
import PortalFilterBar from "@/portal/components/PortalFilterBar";
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
    <PageContainer>
      <PageHeader
        title={`Siswa Kelas ${className ?? id}`}
        description="Daftar siswa pada kelas yang menjadi scope mengajar Anda."
      />

      <PortalFilterBar className="mb-6">
        <form onSubmit={handleSearch} className="min-w-[240px] flex-1 max-w-xs">
          <Search value={search} onChange={setSearch} placeholder="Cari nama / NIS / NISN" />
        </form>
        {meta && <span className="text-sm text-slate-500">{meta.total} siswa aktif</span>}
      </PortalFilterBar>

      {error ? (
        <PortalErrorState message={error} />
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
                <span className="font-medium text-slate-900">
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
      {meta && !error && (
        <div className="mt-4">
          <Pagination
            meta={{ current_page: meta.current_page, last_page: meta.last_page, per_page: 20, total: meta.total }}
            onPageChange={(n) => { setPage(n); load(n, search); }}
            loading={loading}
            error={error}
          />
        </div>
      )}
    </PageContainer>
  );
}
