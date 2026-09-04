import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, BookOpen } from "lucide-react";
import { teacherClassService } from "@/features/academic";
import type { TeacherClass } from "@/features/academic";
import { toApiError } from "@/lib/api";
import Card, { CardBody } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import PortalLoadingState from "@/portal/components/PortalLoadingState";

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    teacherClassService
      .list()
      .then((res) => setClasses(res.data ?? []))
      .catch((err) => setError(toApiError(err).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Kelas Saya" description="Kelas yang menjadi scope mengajar Anda." />
        <PortalLoadingState />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Kelas Saya" description="Kelas yang menjadi scope mengajar Anda." />
        <PortalErrorState message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (classes.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Kelas Saya" description="Kelas yang menjadi scope mengajar Anda." />
        <PortalEmptyState icon={<BookOpen className="h-10 w-10" />} description="Belum ada kelas yang menjadi scope mengajar Anda." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Kelas Saya" description="Kelas yang menjadi scope mengajar Anda." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => {
          const studentCount = Number(c.students_count) || 0;
          const slug = c.name.toLowerCase().replace(/\s+/g, "-");
          return (
            <Link
              key={c.id}
              to={`/guru/academic/classes/${c.id}`}
              state={{ className: c.name }}
              className="group block"
            >
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardBody>
                  <h3 className="font-semibold text-slate-900">{c.name}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {c.level && <Badge variant="secondary">{c.level}</Badge>}
                    {c.academic_year && <Badge variant="neutral">{c.academic_year}</Badge>}
                  </div>
                  <div className="mt-4 flex items-center gap-5 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {studentCount} siswa
                    </span>
                    <span className="font-semibold text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
                      Lihat siswa →
                    </span>
                  </div>
                  <span className="sr-only">{`Buka kelas ${slug}`}</span>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}
