import { useCallback, useEffect, useState } from "react";
import { Clock, Calendar } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PortalFilterBar from "@/portal/components/PortalFilterBar";
import PortalErrorState from "@/portal/components/PortalErrorState";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import AppSelect from "../../../components/ui/Select";

interface Schedule {
  id: number;
  day: string;
  start_time: string | null;
  end_time: string | null;
  subject_name: string;
  teacher_name: string | null;
  room_name: string | null;
}

const DAY_LABELS: Record<string, string> = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
};

export default function StudentSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const params: { day?: string; semester_id?: number } = {};
      if (selectedDay !== "semua") params.day = selectedDay;
      const res = await api.get<{ success: boolean; data: Schedule[] }>(
        STUDENTS.SCHEDULES,
        params,
      );
      setSchedules(res.data ?? []);
    } catch (err) {
      const msg = toApiError(err).message;
      setError(msg);
      toast.error("Gagal memuat jadwal", { description: msg });
    } finally {
      setLoading(false);
    }
  }, [selectedDay]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const dayOptions = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];

  const tableData = schedules.map((s) => ({
    id: s.id,
    day: DAY_LABELS[s.day] ?? s.day,
    jam:
      (s.start_time ?? "-") +
      (s.end_time ? ` - ${s.end_time}` : ""),
    subject_name: s.subject_name,
    teacher_name: s.teacher_name ?? "-",
    room_name: s.room_name ?? "-",
  }));

  const columns = [
    { header: "Hari", accessor: "day" as const, render: (v: unknown) => <Badge variant="secondary">{String(v)}</Badge> },
    { header: "Jam", accessor: "jam" as const, render: (v: unknown) => <span className="flex items-center gap-1 text-slate-600"><Clock className="h-3 w-3" />{String(v)}</span> },
    { header: "Mata Pelajaran", accessor: "subject_name" as const, render: (v: unknown) => <span className="font-medium text-slate-900">{String(v)}</span> },
    { header: "Guru", accessor: "teacher_name" as const },
    { header: "Ruangan", accessor: "room_name" as const },
  ];

  return (
    <PageContainer>
      <PageHeader title="Jadwal" description="Jadwal pelajaran berdasarkan kelas Anda" />

      <PortalFilterBar>
          <Calendar className="h-4 w-4 text-slate-500" />
          <label className="text-sm font-medium text-slate-700">Hari:</label>
          <div className="min-w-[200px]">
            <AppSelect
              options={[
                { value: "semua", label: "Semua Hari" },
                ...dayOptions.map((d) => ({ value: d, label: DAY_LABELS[d] ?? d })),
              ]}
              value={selectedDay}
              onChange={(v) => setSelectedDay(v ?? "semua")}
              placeholder="Pilih hari..."
              isSearchable={false}
            />
          </div>
        </PortalFilterBar>

      {error ? (
        <PortalErrorState message={error} onRetry={load} />
      ) : (
        <DataTable
          columns={columns}
          data={tableData}
          loading={loading}
          emptyMessage="Belum ada jadwal untuk filter yang dipilih."
        />
      )}
    </PageContainer>
  );
}