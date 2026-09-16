import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarCheck, Save } from "lucide-react";
import { toast } from "sonner";
import AppSelect from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import PortalEmptyState from "@/portal/components/PortalEmptyState";
import PortalErrorState from "@/portal/components/PortalErrorState";
import PortalLoadingState from "@/portal/components/PortalLoadingState";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
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
  const [search, setSearch] = useState("");

  const [rows, setRows] = useState<TeacherAttendanceStudent[]>([]);
  const [statusById, setStatusById] = useState<Record<number, StatusKey>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const searchTimeout = useRef<number | null>(null);

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

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.nis?.toLowerCase().includes(q) ||
        r.nisn?.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    searchTimeout.current = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      loadRoster();
    }, 400);
  }, [loadRoster]);

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
    <PageContainer>
      <PageHeader
        title="Kehadiran"
        description="Input kehadiran siswa pada kelas yang menjadi scope mengajar Anda."
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:flex-wrap">
          <div className="w-full md:max-w-xs">
            <Search value={search} onChange={handleSearchChange} placeholder="Cari nama / NIS / NISN..." />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Kelas</span>
              <AppSelect<number>
                options={classOptions}
                value={classId}
                onChange={setClassId}
                placeholder="Pilih kelas"
                isSearchable={false}
                className="min-w-[180px]"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
              <span className="whitespace-nowrap">Tanggal</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="min-w-[180px] rounded-xl border border-outline bg-surface px-3 py-2 text-sm text-primary focus:border-primary-container focus:outline-none"
              />
            </label>
            <Button onClick={loadRoster} disabled={!hasSelection || loading}>
              Tampilkan
            </Button>
          </div>
        </div>

        {!hasSelection ? (
          <PortalEmptyState icon={<CalendarCheck className="h-10 w-10" />} description="Pilih tanggal dan kelas untuk melihat kehadiran." />
        ) : error ? (
          <PortalErrorState message={error} />
        ) : loading ? (
          <PortalLoadingState />
        ) : filteredRows.length === 0 ? (
          <PortalEmptyState icon={<CalendarCheck className="h-10 w-10" />} description="Tidak ada siswa aktif pada kelas ini." />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-secondary">{filteredRows.length} siswa aktif</p>
              {canManage && (
                <Button onClick={handleSave} loading={saving} leftIcon={<Save className="h-4 w-4" />}>
                  Simpan Kehadiran
                </Button>
              )}
            </div>
            <DataTable<TeacherAttendanceStudent>
              loading={loading}
              emptyMessage="Tidak ada data kehadiran."
              columns={[
                {
                  header: "No",
                  accessor: "student_id",
                  render: (_v, row) => filteredRows.findIndex((r) => r.student_id === row.student_id) + 1,
                },
                { header: "Nama", accessor: "name", render: (v) => <span className="font-medium text-on-surface">{String(v ?? "-")}</span> },
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
                      <AppSelect
                        size="sm"
                        options={ATTENDANCE_STATUSES.map((s) => ({ value: s, label: ATTENDANCE_STATUS_LABELS[s] }))}
                        value={cur || null}
                        onChange={(v) => setStatusById((prev) => ({ ...prev, [row.student_id]: v as StatusKey }))}
                        placeholder="Pilih"
                        isSearchable={false}
                        className="min-w-[140px]"
                      />
                    );
                  },
                },
              ]}
              data={filteredRows}
            />
            {canManage && hasAnyMissing && (
              <p className="mt-3 text-xs text-error">Beberapa siswa belum dipilih statusnya.</p>
            )}
          </>
        )}
      </Card>
    </PageContainer>
  );
}
