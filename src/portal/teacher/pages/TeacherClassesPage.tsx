import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { teacherClassService } from "@/features/academic";
import type { TeacherClass } from "@/features/academic";
import { toApiError } from "@/lib/api";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

/**
 * Kelas Saya (Portal Guru) — memanggil GET /api/teacher/classes.
 * Scope ditentukan backend dari user login; client tidak mengirim teacher_id.
 */
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Kelas Saya</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Kelas yang menjadi scope mengajar Anda.
        </p>
      </div>

      {error ? (
        <Card>
          <CardBody>
            <p className="text-sm text-error">Gagal memuat data kelas: {error}</p>
          </CardBody>
        </Card>
      ) : classes.length === 0 && !loading ? (
        <Card>
          <CardBody>
            <p className="text-sm text-center text-on-surface-variant">
              Belum ada kelas yang menjadi scope mengajar Anda.
            </p>
          </CardBody>
        </Card>
      ) : (
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
                  <CardHeader title={c.name} />
                  <CardBody>
                    <div className="flex flex-wrap items-center gap-2">
                      {c.level && <Badge variant="secondary">{c.level}</Badge>}
                      {c.academic_year && (
                        <Badge variant="neutral">{c.academic_year}</Badge>
                      )}
                    </div>
                    <div className="mt-4 flex items-center gap-5 text-sm text-on-surface-variant">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {studentCount} siswa
                      </span>
                      <span className="text-primary font-semibold opacity-0 transition-opacity group-hover:opacity-100">
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
      )}
    </div>
  );
}
