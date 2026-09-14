import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { teacherClassService } from "@/features/academic";
import type { TeacherClass } from "@/features/academic";
import { toApiError } from "@/lib/api";
import Card from "@/components/ui/Card";
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
          return (
            <Link
              key={c.id}
              to={`/guru/academic/classes/${c.id}`}
              state={{ className: c.name }}
              className="block h-full"
            >
              <Card className="group h-full border border-outline-variant rounded-2xl p-4 flex flex-col gap-2 transition-shadow hover:shadow-md">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-primary">{c.name}</h3>
                  {c.level && <Badge variant="secondary">{c.level}</Badge>}
                  {c.academic_year && <Badge variant="neutral">{c.academic_year}</Badge>}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">{studentCount} siswa</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-primary">
                    Lihat siswa
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}
