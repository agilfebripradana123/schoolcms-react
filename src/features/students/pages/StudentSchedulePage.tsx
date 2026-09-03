import { useEffect, useMemo, useState } from "react";
import { Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTS } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";

interface Schedule {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  subject_name: string;
  teacher_name: string | null;
  room_name: string | null;
}

const DAYS_ID = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("semua");

  async function load() {
    try {
      const params: { day?: string } = {};
      if (selectedDay !== "semua") {
        params.day = selectedDay;
      }

      const res = await api.get<{ success: boolean; data: Schedule[] }>(
        STUDENTS.SCHEDULES,
        params,
      );
      setSchedules(res.data);
    } catch (err) {
      const msg = toApiError(err).message;
      setError(msg);
      toast.error("Gagal memuat jadwal", { description: msg });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

  const groupedSchedules = useMemo(() => {
    const groups: Record<string, Schedule[]> = {};
    schedules.forEach((s) => {
      const day = s.day;
      if (!groups[day]) groups[day] = [];
      groups[day].push(s);
    });
    // Sort each group by start_time
    Object.keys(groups).forEach((day) => {
      groups[day].sort((a, b) => {
        const aTime = a.start_time || "00:00";
        const bTime = b.start_time || "00:00";
        return aTime.localeCompare(bTime);
      });
    });
    return groups;
  }, [schedules]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-600">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jadwal Pelajaran</h1>
          <p className="mt-1 text-sm text-slate-500">Jadwal pelajaran Anda</p>
        </div>
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <Calendar className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">Belum ada jadwal.</p>
        </div>
      </div>
    );
  }

  // Get sorted days to display
  const displayDay = selectedDay === "semua" ? DAYS_ID : [selectedDay];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Jadwal Pelajaran</h1>
        <p className="mt-1 text-sm text-slate-500">Jadwal pelajaran Anda</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Hari:</label>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="semua">Semua Hari</option>
          {DAYS_ID.map((d) => (
            <option key={d} value={d}>
              {DAY_LABELS[d]}
            </option>
          ))}
        </select>
      </div>

      {/* Schedule */}
      <div className="space-y-4">
        {displayDay
          .filter((day) => (selectedDay === "semua" || day === selectedDay))
          .map((day) => {
            const daySchedules = groupedSchedules[day] || [];
            if (daySchedules.length === 0) return null;

            return (
              <div key={day} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {DAY_LABELS[day]}
                  </h3>
                </div>
                <ul className="divide-y divide-slate-100">
                  {daySchedules.map((item) => (
                    <li key={item.id} className="flex items-center justify-between px-6 py-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{item.subject_name}</p>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>
                            <span className="font-medium">Jam:</span>{" "}
                            {item.start_time ?? "-"} - {item.end_time ?? "-"}
                          </span>
                          {item.teacher_name && (
                            <span>{item.teacher_name}</span>
                          )}
                          {item.room_name && (
                            <span>Rm: {item.room_name}</span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
      </div>
    </div>
  );
}