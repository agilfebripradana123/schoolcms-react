import { useCallback, useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";
import { formatDate } from "@/lib/format";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardBody } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface Assignment {
  id: number;
  title: string;
  description?: string | null;
  subject_id: number;
  class_id: number;
  teacher_id?: number | null;
  due_date?: string | null;
  subject?: { name: string } | null;
  created_at?: string | null;
}

export default function StudentAssignmentsPage() {
  const [rows, setRows] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: Assignment[] }>(STUDENTS.ASSIGNMENTS);
      setRows(res.data ?? []);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      toast.error("Gagal memuat tugas", { description: apiErr.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Tugas" description="Daftar tugas yang harus dikerjakan" />
        <Card><CardBody><p className="text-sm text-slate-500">Memuat...</p></CardBody></Card>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Tugas" description="Daftar tugas yang harus dikerjakan" />
        <Card><CardBody className="text-sm text-red-600">{error}</CardBody></Card>
      </PageContainer>
    );
  }

  if (rows.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Tugas" description="Daftar tugas yang harus dikerjakan" />
        <Card>
          <CardBody className="p-12 text-center">
            <Calendar className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-400">Belum ada tugas.</p>
          </CardBody>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Tugas" description="Daftar tugas yang harus dikerjakan" />

      <div className="space-y-3 mb-6">
        {rows.map((a) => (
          <Card key={a.id}>
            <CardBody>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{a.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">{a.description ?? "Tidak ada deskripsi"}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <Badge variant="secondary">
                      <Calendar className="h-3 w-3" />
                      {a.subject?.name ?? `Mata pelajaran #${a.subject_id}`}
                    </Badge>
                    {a.due_date && (
                      <Badge variant="warning">
                        <Clock className="h-3 w-3" />
                        Jatuh tempo: {formatDate(a.due_date)}
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge variant="warning">
                  <Clock className="h-3 w-3 mr-1" />
                  Belum dikumpulkan
                </Badge>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody className="bg-amber-50/50">
          <p className="text-sm text-amber-800">
            <strong>Catatan:</strong> Fitur pengumpulan tugas (submission) belum tersedia.
            Silakan hubungi guru mata pelajaran untuk tata cara pengumpulan.
          </p>
        </CardBody>
      </Card>
    </PageContainer>
  );
}