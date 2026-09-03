import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarCheck, Save } from "lucide-react";
import { toast } from "sonner";
import Select from "@/components/ui/Select";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import { usePermission } from "@/features/auth/usePermission";
import { teacherClassService, teacherAttendanceService } from "@/features/academic";
import type {
  TeacherClass,
  TeacherAttendanceStudent,
  AttendanceStatus,
} from "@/features/academic/api/types";
import { ATTENDANCE_STATUSES, ATTENDANCE_STATUS_LABELS } from "@/features/academic/api/types";
import { toApiError } from "@/lib/api";
import type { SelectOption } from "@/components/ui/Select";

type StatusKey = AttendanceStatus | "";

export default function TeacherAttendancePage() {
  const { can } = usePermission();
  const canManage = can("manage-attendance");

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [classId, setClassId] = useState<number | null>(null);
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const [rows, setRows] = useState<TeacherAttendanceStudent[]>([]);
  const [statusById, setStatusById] = useState<Record<number, StatusKey>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadClasses = useCallback(() => {
    teacherClassService
      .list()
      .then((res) => setClasses(res.data ?? []))
      .catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const classOptions = useMemo<SelectOption<number>[]>(
    () => classes.map((c) => ({ value: c.id, label: c.name })),
    [classes],
  );

  const loadRoster = useCallback(() => {
    if (!classId || !date) return;
    setLoading(true);
    setError(null);
    teacherAttendanceService
      .roster(classId, date)
      .then((res) => {
        const students = res.data?.students ?? [];
        setRows(students);
        const next: Record<number, StatusKey> = {};
        for (const s of students) {
          next[s.student_id] = s.status ?? "hadir";
        }
        setStatusById(next);
      })
      .catch((err) => setError(toApiError(err).message))
      .finally(() => setLoading(false));
  }, [classId, date]);

  const hasSelection = !!classId && !!date;

  const handleSave = async () => {
    if (!classId || !date) return;
    const items = rows.map((r) => {
      const status = (statusById[r.student_id] || "hadir") as AttendanceStatus;
      return {
        student_id: r.student_id,
        status,
        note: null,
      };
    });
    setSaving(true);
    try {
      await teacherAttendanceService.save({ class_id: classId, date, items });
      toast.success("Kehadiran berhasil disimpan.");
      loadRoster();
    } catch (err) {
      toast.error("Gagal menyimpan kehadiran", { description: toApiError(err).message });
    } finally {
      setSaving(false);
    }
  };

  const hasAnyMissing = rows.some((r) => !statusById[r.student_id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Kehadiran</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Input kehadiran siswa pada kelas yang menjadi scope mengajar Anda.
        </p>
      </div>

      {/* Filter: Tanggal + Kelas (server-side) */}
      <Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Tanggal
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-on-surface focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              Kelas
            </label>
            <Select<number>
              options={classOptions}
              value={classId}
              onChange={setClassId}
              placeholder="Pilih kelas"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={loadRoster} disabled={!hasSelection || loading} className="w-full">
              Tampilkan
            </Button>
          </div>
        </div>
      </Card>

      {!hasSelection ? (
        <Card>
          <CardBody>
            <p className="text-center text-sm text-on-surface-variant">
              Pilih tanggal dan kelas untuk melihat kehadiran.
            </p>
          </CardBody>
        </Card>
      ) : error ? (
        <Card>
          <CardBody>
            <p className="text-sm text-error">Gagal memuat kehadiran: {error}</p>
          </CardBody>
        </Card>
      ) : loading ? (
        <Card>
          <CardBody>
            <p className="text-center text-sm text-on-surface-variant">Memuat data kehadiran...</p>
          </CardBody>
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center">
              <CalendarCheck className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-on-surface">Tidak ada data kehadiran.</p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Tidak ada siswa aktif pada kelas ini.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Daftar Siswa"
            description={`${rows.length} siswa aktif`}
            actions={
              canManage ? (
                <Button onClick={handleSave} loading={saving} leftIcon={<Save className="h-4 w-4" />}>
                  Simpan Kehadiran
                </Button>
              ) : undefined
            }
          />
          <CardBody>
            <DataTable<TeacherAttendanceStudent>
              loading={loading}
              emptyMessage="Tidak ada data kehadiran."
              columns={[
                {
                  header: "No",
                  accessor: "student_id",
                  render: (_v, row) => rows.findIndex((r) => r.student_id === row.student_id) + 1,
                },
                { header: "Nama", accessor: "name", render: (v) => <span className="font-semibold text-on-surface">{String(v ?? "-")}</span> },
                { header: "NIS", accessor: "nis", render: (v) => String(v ?? "-") },
                { header: "NISN", accessor: "nisn", render: (v) => String(v ?? "-") },
                {
                  header: "Status",
                  accessor: "student_id",
                  render: (_v, row) => {
                    const cur = statusById[row.student_id] as AttendanceStatus | "";
                    if (!canManage) {
                      const cls: Record<string, "success" | "warning" | "danger" | "neutral"> = {
                        hadir: "success",
                        sakit: "warning",
                        izin: "danger",
                        alpa: "neutral",
                      };
                      return <Badge variant={cur ? cls[cur] : "neutral"}>{cur ? ATTENDANCE_STATUS_LABELS[cur] : "—"}</Badge>;
                    }
                    return (
                      <select
                        value={cur}
                        onChange={(e) =>
                          setStatusById((prev) => ({
                            ...prev,
                            [row.student_id]: e.target.value as StatusKey,
                          }))
                        }
                        className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm text-on-surface focus:border-primary-container focus:outline-none"
                      >
                        {ATTENDANCE_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {ATTENDANCE_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    );
                  },
                },
              ]}
              data={rows}
            />
            {canManage && hasAnyMissing && (
              <p className="mt-3 text-xs text-error">Beberapa siswa belum dipilih statusnya.</p>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
