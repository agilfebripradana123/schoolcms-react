import { useEffect, useState } from "react";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { parentService } from "../api/parent.service";
import { guardianService } from "../api/guardian.service";
import { studentHistoryService } from "../api/student-history.service";
import { attendanceService } from "../api/attendance.service";
import { transferService } from "../api/transfer.service";
import { studentIdCardService } from "../api/student-id-card.service";
import type {
  Attendance,
  Guardian,
  Student,
  StudentHistory,
  StudentIdCard,
  StudentParent,
  Transfer,
} from "../api/types";

interface StudentDetailProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
}

const ATTENDANCE_META: Record<string, "success" | "primary" | "neutral" | "danger"> = {
  hadir: "success",
  sakit: "primary",
  izin: "neutral",
  alpa: "danger",
};

const HISTORY_META: Record<string, "success" | "warning"> = {
  naik: "success",
  tinggal: "warning",
  mutasi_masuk: "warning",
  mutasi_keluar: "warning",
};

const TRANSFER_META: Record<string, "success" | "danger"> = {
  masuk: "success",
  keluar: "danger",
};

const CARD_META: Record<string, "success" | "danger" | "warning" | "neutral"> = {
  aktif: "success",
  hilang: "danger",
  rusak: "warning",
  nonaktif: "neutral",
};

const ATTENDANCE_LABEL: Record<string, string> = {
  hadir: "Hadir",
  sakit: "Sakit",
  izin: "Izin",
  alpa: "Alpa",
};

const HISTORY_LABEL: Record<string, string> = {
  naik: "Naik Kelas",
  tinggal: "Tinggal Kelas",
  mutasi_masuk: "Mutasi Masuk",
  mutasi_keluar: "Mutasi Keluar",
};

const TRANSFER_LABEL: Record<string, string> = {
  masuk: "Masuk",
  keluar: "Keluar",
};

const CARD_LABEL: Record<string, string> = {
  aktif: "Aktif",
  hilang: "Hilang",
  rusak: "Rusak",
  nonaktif: "Nonaktif",
};

function fmtDate(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value.substring(0, 10)
    : d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <p className="text-sm">
      <span className="text-on-surface-variant">{label}: </span>
      <span className="text-on-surface">{value || "-"}</span>
    </p>
  );
}

export default function StudentDetail({ open, onClose, student }: StudentDetailProps) {
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState<StudentParent[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [histories, setHistories] = useState<StudentHistory[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [cards, setCards] = useState<StudentIdCard[]>([]);

  useEffect(() => {
    if (!open || !student) return;
    let active = true;
    setLoading(true);
    setParents([]);
    setGuardians([]);
    setHistories([]);
    setAttendances([]);
    setTransfers([]);
    setCards([]);

    const sid = student.id;
    Promise.allSettled([
      parentService.list(),
      guardianService.list(),
      studentHistoryService.list(),
      attendanceService.list(),
      transferService.list(),
      studentIdCardService.list(),
    ]).then(([p, g, h, a, t, c]) => {
      if (!active) return;
      if (p.status === "fulfilled") setParents(p.value.data.filter((x) => x.student_id === sid));
      if (g.status === "fulfilled") setGuardians(g.value.data.filter((x) => x.student_id === sid));
      if (h.status === "fulfilled") setHistories(h.value.data.filter((x) => x.student_id === sid));
      if (a.status === "fulfilled") setAttendances(a.value.data.filter((x) => x.student_id === sid));
      if (t.status === "fulfilled") setTransfers(t.value.data.filter((x) => x.student_id === sid));
      if (c.status === "fulfilled") setCards(c.value.data.filter((x) => x.student_id === sid));
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [open, student]);

  const parent = parents[0];
  const guardian = guardians[0];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail Siswa"
      size="lg"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-slate-200"
        >
          Tutup
        </button>
      }
    >
      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">Memuat data lengkap...</p>
      ) : (
        <div className="space-y-4">
          {/* Data Siswa */}
          <Section title="Data Siswa">
            <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
              <Field label="NISN" value={student?.nisn} />
              <Field label="NIS" value={student?.nis} />
              <Field label="Nama" value={student?.name} />
              <Field label="Jenis Kelamin" value={student?.gender === "L" ? "Laki-laki" : "Perempuan"} />
              <Field label="Tempat Lahir" value={student?.birth_place} />
              <Field label="Tanggal Lahir" value={fmtDate(student?.birth_date)} />
              <Field label="Alamat" value={student?.address} />
              <Field label="Telepon" value={student?.phone} />
            </div>
          </Section>

          {/* Orang Tua */}
          <Section title="Orang Tua">
            {parent ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                <Field label="Ayah" value={parent.father_name} />
                <Field label="Ibu" value={parent.mother_name} />
                <Field label="Pekerjaan Ayah" value={parent.father_occupation} />
                <Field label="Pekerjaan Ibu" value={parent.mother_occupation} />
                <Field label="Telepon" value={parent.phone} />
                <Field label="Alamat" value={parent.address} />
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">Belum ada data.</p>
            )}
          </Section>

          {/* Wali */}
          <Section title="Wali">
            {guardian ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                <Field label="Nama" value={guardian.name} />
                <Field label="Hubungan" value={guardian.relation} />
                <Field label="Pekerjaan" value={guardian.occupation} />
                <Field label="Telepon" value={guardian.phone} />
                <Field label="Alamat" value={guardian.address} />
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">Belum ada data.</p>
            )}
          </Section>

          {/* Riwayat */}
          <Section title="Riwayat">
            {histories.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Belum ada data.</p>
            ) : (
              <div className="space-y-2">
                {histories.map((h) => (
                  <div key={h.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant={HISTORY_META[h.status ?? ""] ?? "neutral"}>
                      {HISTORY_LABEL[h.status ?? ""] ?? h.status ?? "-"}
                    </Badge>
                    <span className="text-on-surface">
                      {h.class?.name ?? "-"} · {h.academic_year?.name ?? "-"}
                    </span>
                    <span className="text-on-surface-variant">{h.notes ?? ""}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Kehadiran */}
          <Section title="Kehadiran">
            {attendances.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Belum ada data.</p>
            ) : (
              <div className="space-y-2">
                {attendances.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant={ATTENDANCE_META[a.status ?? ""] ?? "neutral"}>
                      {ATTENDANCE_LABEL[a.status ?? ""] ?? a.status ?? "-"}
                    </Badge>
                    <span className="text-on-surface">{fmtDate(a.date)}</span>
                    <span className="text-on-surface-variant">{a.class?.name ?? ""}</span>
                    <span className="text-on-surface-variant">{a.note ?? ""}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Mutasi */}
          <Section title="Mutasi">
            {transfers.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Belum ada data.</p>
            ) : (
              <div className="space-y-2">
                {transfers.map((t) => (
                  <div key={t.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant={TRANSFER_META[t.type ?? ""] ?? "neutral"}>
                      {TRANSFER_LABEL[t.type ?? ""] ?? t.type ?? "-"}
                    </Badge>
                    <span className="text-on-surface">{fmtDate(t.transfer_date)}</span>
                    <span className="text-on-surface-variant">
                      {t.from_school || "-"} → {t.to_school || "-"}
                    </span>
                    <span className="text-on-surface-variant">{t.reason ?? ""}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Kartu Pelajar */}
          <Section title="Kartu Pelajar">
            {cards.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Belum ada data.</p>
            ) : (
              <div className="space-y-2">
                {cards.map((c) => (
                  <div key={c.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-mono text-on-surface">{c.card_number ?? "-"}</span>
                    <Badge variant={CARD_META[c.status ?? ""] ?? "neutral"}>
                      {CARD_LABEL[c.status ?? ""] ?? c.status ?? "-"}
                    </Badge>
                    <span className="text-on-surface-variant">
                      Terbit {fmtDate(c.issued_date)} · s/d {fmtDate(c.valid_until)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}
    </Modal>
  );
}