import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { parentService } from "../api/parent.service";
import { guardianService } from "../api/guardian.service";
import type { Guardian, Student, StudentParent } from "../api/types";

interface StudentDetailProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
}

function fmtDate(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value.substring(0, 10)
    : d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
      {children}
    </h3>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-outline">{label}</dt>
      <dd className="mt-0.5 text-sm text-on-surface">{value || "-"}</dd>
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">{children}</dl>;
}

export default function StudentDetail({ open, onClose, student }: StudentDetailProps) {
  const [loading, setLoading] = useState(false);
  const [parent, setParent] = useState<StudentParent | null>(null);
  const [guardian, setGuardian] = useState<Guardian | null>(null);

  const [previousOpen, setPreviousOpen] = useState(open);
  const [previousStudent, setPreviousStudent] = useState(student);

  if (open !== previousOpen || student !== previousStudent) {
    setPreviousOpen(open);
    setPreviousStudent(student);

    if (open && student) {
      setLoading(true);
      setParent(null);
      setGuardian(null);
    }
  }

  useEffect(() => {
    if (!open || !student) return;
    let active = true;

    const sid = student.id;
    Promise.allSettled([parentService.list(), guardianService.list()]).then(
      ([p, g]) => {
        if (!active) return;
        if (p.status === "fulfilled") setParent(p.value.data.find((x) => x.student_id === sid) ?? null);
        if (g.status === "fulfilled") setGuardian(g.value.data.find((x) => x.student_id === sid) ?? null);
        setLoading(false);
      },
    );

    return () => {
      active = false;
    };
  }, [open, student]);

  const emptyText = <p className="text-sm text-on-surface-variant">Belum ada data.</p>;

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
        <div className="space-y-6">
          {/* Data Siswa */}
          <section>
            <SectionTitle>Data Siswa</SectionTitle>
            <div className="rounded-2xl border border-slate-200 p-5">
              <FieldGrid>
                <Field label="NISN" value={student?.nisn} />
                <Field label="NIS" value={student?.nis} />
                <Field label="Nama" value={student?.name} />
                <Field label="Jenis Kelamin" value={student?.gender === "L" ? "Laki-laki" : "Perempuan"} />
                <Field label="Tempat Lahir" value={student?.birth_place} />
                <Field label="Tanggal Lahir" value={fmtDate(student?.birth_date)} />
                <Field label="Alamat" value={student?.address} />
                <Field label="Telepon" value={student?.phone} />
              </FieldGrid>
            </div>
          </section>

          {/* Orang Tua */}
          <section>
            <SectionTitle>Orang Tua</SectionTitle>
            <div className="rounded-2xl border border-slate-200 p-5">
              {parent ? (
                <FieldGrid>
                  <Field label="Ayah" value={parent.father_name} />
                  <Field label="Ibu" value={parent.mother_name} />
                  <Field label="Pekerjaan Ayah" value={parent.father_occupation} />
                  <Field label="Pekerjaan Ibu" value={parent.mother_occupation} />
                  <Field label="Telepon" value={parent.phone} />
                  <Field label="Alamat" value={parent.address} />
                </FieldGrid>
              ) : (
                emptyText
              )}
            </div>
          </section>

          {/* Wali */}
          <section>
            <SectionTitle>Wali</SectionTitle>
            <div className="rounded-2xl border border-slate-200 p-5">
              {guardian ? (
                <FieldGrid>
                  <Field label="Nama" value={guardian.name} />
                  <Field label="Hubungan" value={guardian.relation} />
                  <Field label="Pekerjaan" value={guardian.occupation} />
                  <Field label="Telepon" value={guardian.phone} />
                  <Field label="Alamat" value={guardian.address} />
                </FieldGrid>
              ) : (
                emptyText
              )}
            </div>
          </section>
        </div>
      )}
    </Modal>
  );
}