import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import type { Registrant } from "../api/types";

interface RegistrantDetailProps {
  open: boolean;
  onClose: () => void;
  registrant: Registrant | null;
}

function fmtDate(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value.substring(0, 10)
    : d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-outline">{label}</dt>
      <dd className="mt-0.5 text-sm text-on-surface">{value || "-"}</dd>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">{children}</dl>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-on-surface-variant">{title}</h3>
      <div className="rounded-2xl border border-slate-200 p-5">{children}</div>
    </section>
  );
}

const STATUS_META: Record<string, { label: string; variant: "success" | "warning" | "danger" | "primary" | "neutral" }> = {
  draft: { label: "Draft", variant: "neutral" },
  submitted: { label: "Diajukan", variant: "primary" },
  verified: { label: "Terverifikasi", variant: "success" },
  selected: { label: "Diterima", variant: "success" },
  not_selected: { label: "Tidak Lolos", variant: "danger" },
  re_registered: { label: "Daftar Ulang", variant: "primary" },
  cancelled: { label: "Dibatalkan", variant: "danger" },
};

export default function RegistrantDetail({ open, onClose, registrant }: RegistrantDetailProps) {
  const r = registrant;
  const statusMeta = STATUS_META[r?.status ?? ""] ?? { label: r?.status ?? "-", variant: "neutral" as const };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail Pendaftaran"
      size="lg"
      footer={
        <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-slate-200">
          Tutup
        </button>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-outline">No. Pendaftaran</p>
            <p className="mt-0.5 font-semibold text-on-surface">{r?.registration_number ?? "-"}</p>
          </div>
          <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
        </div>

        <Section title="Identitas">
          <Grid>
            <Field label="Nama Lengkap" value={r?.full_name} />
            <Field label="Email" value={r?.email} />
            <Field label="Jenis Kelamin" value={r?.gender === "L" ? "Laki-laki" : r?.gender === "P" ? "Perempuan" : undefined} />
            <Field label="NIK" value={r?.nik} />
            <Field label="NISN" value={r?.nisn} />
            <Field label="Telepon" value={r?.phone} />
            <Field label="Tempat Lahir" value={r?.birth_place} />
            <Field label="Tanggal Lahir" value={fmtDate(r?.birth_date)} />
            <Field label="Agama" value={r?.religion} />
          </Grid>
        </Section>

        <Section title="Alamat">
          <Grid>
            <Field label="Alamat" value={r?.address} />
            <Field label="RT/RW" value={r?.rt && r?.rw ? `${r.rt}/${r.rw}` : r?.rt || r?.rw} />
            <Field label="Kelurahan" value={r?.village} />
            <Field label="Kecamatan" value={r?.district} />
            <Field label="Kota/Kabupaten" value={r?.city} />
            <Field label="Provinsi" value={r?.province} />
            <Field label="Kode Pos" value={r?.postal_code} />
          </Grid>
        </Section>

        <Section title="Asal Sekolah & PPDB">
          <Grid>
            <Field label="Asal Sekolah" value={r?.previous_school} />
            <Field label="NPSN" value={r?.previous_school_npsn} />
            <Field label="Tahun Lulus" value={r?.graduation_year} />
            <Field label="Jalur" value={r?.registration_path} />
            <Field label="Program" value={r?.program_choice} />
            <Field label="Tanggal Daftar" value={fmtDate(r?.registration_date)} />
          </Grid>
        </Section>

        <Section title="Orang Tua & Wali">
          <Grid>
            <Field label="Ayah" value={r?.father_name} />
            <Field label="Pendidikan Ayah" value={r?.father_education} />
            <Field label="Pekerjaan Ayah" value={r?.father_occupation} />
            <Field label="Telepon Ayah" value={r?.father_phone} />
            <Field label="Ibu" value={r?.mother_name} />
            <Field label="Pendidikan Ibu" value={r?.mother_education} />
            <Field label="Pekerjaan Ibu" value={r?.mother_occupation} />
            <Field label="Telepon Ibu" value={r?.mother_phone} />
            <Field label="Wali" value={r?.guardian_name} />
            <Field label="Pendidikan Wali" value={r?.guardian_education} />
            <Field label="Pekerjaan Wali" value={r?.guardian_occupation} />
            <Field label="Telepon Wali" value={r?.guardian_phone} />
          </Grid>
        </Section>

        <Section title="Penilaian & Status">
          <Grid>
            <Field label="Status" value={r?.status} />
            <Field label="Verifikasi" value={r?.verification_status} />
            <Field label="Verified By" value={r?.verified_by} />
            <Field label="Verified At" value={fmtDate(r?.verified_at)} />
            <Field label="Status Seleksi" value={r?.selection_status} />
            <Field label="Skor Seleksi" value={r?.selection_score} />
            <Field label="Diterima At" value={fmtDate(r?.selected_at)} />
            <Field label="Status Daftar Ulang" value={r?.re_registration_status} />
            <Field label="Tanggal Daftar Ulang" value={fmtDate(r?.re_registration_date)} />
            <Field label="Catatan Daftar Ulang" value={r?.re_registration_notes} />
            {r?.student_id && (
              <div className="sm:col-span-2">
                <Badge variant="success">Sudah menjadi siswa (ID: {r.student_id})</Badge>
              </div>
            )}
          </Grid>
        </Section>
      </div>
    </Modal>
  );
}
