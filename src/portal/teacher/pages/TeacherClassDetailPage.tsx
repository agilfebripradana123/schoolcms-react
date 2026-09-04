import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { teacherClassService } from "@/features/academic";
import type { TeacherClassStudent } from "@/features/academic";
import { toApiError } from "@/lib/api";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/guru/academic/classes"
            className="mb-1 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-container"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
          <h1 className="text-2xl font-bold text-on-surface">
            Siswa Kelas {className ?? id}
          </h1>
        </div>
      </div>

      {error ? (
        <Card>
          <CardBody>
            <p className="text-sm text-error">Gagal memuat data siswa: {error}</p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Daftar Siswa"
            description={
              meta ? `${meta.total} siswa aktif` : undefined
            }
            actions={
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama / NIS / NISN"
                    className="w-56 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-on-surface placeholder-outline transition-colors focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                  />
                </div>
                <Button type="submit" size="sm">Cari</Button>
              </form>
            }
          />
          <CardBody>
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
          </CardBody>
          {meta && meta.last_page > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-on-surface-variant">
                Halaman {meta.current_page} dari {meta.last_page}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => {
                    const next = page - 1;
                    setPage(next);
                    load(next, search);
                  }}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= (meta.last_page ?? 1) || loading}
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    load(next, search);
                  }}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
