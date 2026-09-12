import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { formatDate } from "@/lib/format";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { studentService } from "../api/student.service";
import type { Guardian, Student, StudentParent } from "../api/types";

interface StudentDetailProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
}

const EMPTY = "—";

const RELIGION_LABELS: Record<string, string> = {
  islam: "Islam",
  kristen: "Kristen",
  katolik: "Katolik",
  hindu: "Hindu",
  budha: "Buddha",
  konghucu: "Konghucu",
  lainnya: "Lainnya",
};

const RELATION_LABELS: Record<string, string> = {
  ayah: "Ayah",
  ibu: "Ibu",
  kakek: "Kakek",
  nenek: "Nenek",
  paman: "Paman",
  bibi: "Bibi",
  lainnya: "Lainnya",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
      {children}
    </h3>
  );
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-outline">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-on-surface">{value ?? EMPTY}</dd>
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
      {children}
    </dl>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <div className="rounded-2xl border border-outline-variant p-5">{children}</div>
    </section>
  );
}

function YesNo({ value, labelYes, labelNo }: { value?: boolean | number | null; labelYes: string; labelNo: string }) {
  if (value === null || value === undefined) return EMPTY;
  return value ? labelYes : labelNo;
}

function numberOrDash(value?: unknown): React.ReactNode {
  if (value === null || value === undefined || value === "") return EMPTY;
  return String(value);
}

export default function StudentDetail({
  open,
  onClose,
  student,
}: StudentDetailProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [detail, setDetail] = useState<Student | null>(null);

  const [previousOpen, setPreviousOpen] = useState(open);
  const [previousStudent, setPreviousStudent] = useState(student);

  if (open !== previousOpen || student !== previousStudent) {
    setPreviousOpen(open);
    setPreviousStudent(student);

    if (open) {
      setLoading(true);
      setError(null);
      setDetail(null);
    }
  }

  const load = useCallback(() => {
    if (!open || !student) return;
    let active = true;

    studentService
      .get(student.id)
      .then((res) => {
        if (!active) return;
        setDetail(res.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(toApiError(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, student]);

  useEffect(() => {
    return load();
  }, [load]);

  const s = detail ?? student;
  const parent: StudentParent | null = s?.parent ?? null;
  const guardians: Guardian[] = s?.guardians ?? [];
  const schoolClass = s?.school_class;

  const religionLabel = s?.religion
    ? RELIGION_LABELS[s.religion] ?? s.religion
    : undefined;
  const genderLabel =
    s?.gender === "L" ? "Laki-laki" : s?.gender === "P" ? "Perempuan" : undefined;

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
          className="rounded-xl bg-surface-container-low px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-slate-200"
        >
          Tutup
        </button>
      }
    >
      {loading ? (
        <p className="py-8 text-center text-sm text-outline">Memuat data lengkap...</p>
      ) : error ? (
        <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-xl py-8">
          <p className="text-sm text-error">Gagal memuat data siswa.</p>
          <Button
            variant="secondary"
            onClick={() => {
              setLoading(true);
              setError(null);
              setDetail(null);
              load();
            }}
          >
            Muat Ulang
          </Button>
        </div>
      ) : s ? (
        <div className="space-y-6">
          {/* Identitas */}
          <Section title="Identitas Siswa">
            <FieldGrid>
              <Field label="NISN" value={s.nisn} />
              <Field label="NIS" value={s.nis} />
              <Field label="Nama Lengkap" value={s.name} />
              <Field label="NIK" value={s.nik} />
              <Field label="Jenis Kelamin" value={genderLabel} />
              <Field label="Agama" value={religionLabel} />
              <Field
                label="Tempat, Tanggal Lahir"
                value={
                  s.birth_place
                    ? `${s.birth_place}, ${formatDate(s.birth_date)}`
                    : formatDate(s.birth_date)
                }
              />
              <Field label="Anak Ke-" value={numberOrDash(s.birth_order)} />
              <Field label="Jumlah Saudara" value={numberOrDash(s.sibling_count)} />
            </FieldGrid>
          </Section>

          {/* Data akademik */}
          <Section title="Data Akademik">
            <FieldGrid>
              <Field label="Kelas" value={schoolClass?.name} />
              <Field label="Tingkat" value={schoolClass?.level} />
              <Field label="Akun Login" value={s.user?.name} />
            </FieldGrid>
          </Section>

          {/* Kontak */}
          <Section title="Kontak">
            <FieldGrid>
              <Field label="No. HP / WhatsApp" value={s.phone} />
              <Field label="Telepon Rumah" value={s.telephone} />
              <Field label="Email" value={s.email} />
            </FieldGrid>
          </Section>

          {/* Alamat */}
          <Section title="Alamat">
            <FieldGrid>
              <Field label="Alamat" value={s.address} />
              <Field label="RT / RW" value={s.rt || s.rw ? `${s.rt ?? "-"} / ${s.rw ?? "-"}` : undefined} />
              <Field label="Dusun / Desa" value={s.hamlet} />
              <Field label="Kelurahan" value={s.village} />
              <Field label="Kecamatan" value={s.district} />
              <Field label="Kode Pos" value={s.postal_code} />
              <Field label="Tipe Tempat Tinggal" value={s.residence_type} />
              <Field label="Transportasi" value={s.transportation} />
              <Field
                label="Titik Koordinat"
                value={
                  s.latitude != null || s.longitude != null
                    ? `${numberOrDash(s.latitude)}, ${numberOrDash(s.longitude)}`
                    : undefined
                }
              />
            </FieldGrid>
          </Section>

          {/* Dokumen */}
          <Section title="Dokumen">
            <FieldGrid>
              <Field label="No. Kartu Keluarga" value={s.family_card_number} />
              <Field label="No. Akta Kelahiran" value={s.birth_certificate_registration_number} />
              <Field label="SKHUN" value={s.skhun} />
              <Field label="No. Ijazah" value={s.diploma_serial_number} />
              <Field label="No. Ujian Nasional" value={s.national_exam_number} />
              <Field label="Asal Sekolah" value={s.previous_school} />
            </FieldGrid>
          </Section>

          {/* Data fisik */}
          <Section title="Data Fisik & Kondisi">
            <FieldGrid>
              <Field label="Berat Badan (kg)" value={numberOrDash(s.weight)} />
              <Field label="Tinggi Badan (cm)" value={numberOrDash(s.height)} />
              <Field label="Lingkar Kepala (cm)" value={numberOrDash(s.head_circumference)} />
              <Field label="Jarak ke Sekolah (km)" value={numberOrDash(s.school_distance)} />
              <Field label="Kebutuhan Khusus" value={s.special_needs} />
            </FieldGrid>
          </Section>

          {/* Kesejahteraan */}
          <Section title="Program Kesejahteraan">
            <FieldGrid>
              <Field label="Penerima KPS" value={<YesNo value={s.kps_recipient} labelYes="Ya" labelNo="Tidak" />} />
              <Field label="No. KPS" value={s.kps_number} />
              <Field label="Penerima KIP" value={<YesNo value={s.kip_recipient} labelYes="Ya" labelNo="Tidak" />} />
              <Field label="No. KIP" value={s.kip_number} />
              <Field label="Nama di KIP" value={s.kip_name} />
              <Field label="No. KKS" value={s.kks_number} />
              <Field label="Penerima PIP" value={<YesNo value={s.pip_eligible} labelYes="Ya" labelNo="Tidak" />} />
              <Field label="Alasan PIP" value={s.pip_reason} />
            </FieldGrid>
          </Section>

          {/* Bank */}
          <Section title="Data Bank">
            <FieldGrid>
              <Field label="Nama Bank" value={s.bank_name} />
              <Field label="No. Rekening" value={s.bank_account_number} />
              <Field label="Atas Nama" value={s.bank_account_holder} />
            </FieldGrid>
          </Section>

          {/* Orang Tua */}
          <Section title="Orang Tua">
            {parent ? (
              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-outline">Ayah</p>
                  <FieldGrid>
                    <Field label="Nama" value={parent.father_name} />
                    <Field label="Tahun Lahir" value={numberOrDash(parent.father_birth_year)} />
                    <Field label="Pendidikan" value={parent.father_education} />
                    <Field label="Pekerjaan" value={parent.father_occupation} />
                    <Field label="Penghasilan" value={parent.father_income} />
                    <Field label="NIK" value={parent.father_nik} />
                  </FieldGrid>
                </div>
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-outline">Ibu</p>
                  <FieldGrid>
                    <Field label="Nama" value={parent.mother_name} />
                    <Field label="Tahun Lahir" value={numberOrDash(parent.mother_birth_year)} />
                    <Field label="Pendidikan" value={parent.mother_education} />
                    <Field label="Pekerjaan" value={parent.mother_occupation} />
                    <Field label="Penghasilan" value={parent.mother_income} />
                    <Field label="NIK" value={parent.mother_nik} />
                  </FieldGrid>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <FieldGrid>
                    <Field label="No. Telepon" value={parent.phone} />
                    <Field label="Alamat" value={parent.address} />
                  </FieldGrid>
                </div>
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">Belum ada data orang tua.</p>
            )}
          </Section>

          {/* Wali */}
          <Section title="Wali">
            {guardians.length > 0 ? (
              <div className="space-y-5">
                {guardians.map((g) => (
                  <div key={g.id} className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                    <FieldGrid>
                      <Field label="Nama" value={g.name} />
                      <Field label="Hubungan" value={g.relation ? RELATION_LABELS[g.relation] ?? g.relation : undefined} />
                      <Field label="NIK" value={g.nik} />
                      <Field label="Tahun Lahir" value={numberOrDash(g.birth_year)} />
                      <Field label="Pendidikan" value={g.education} />
                      <Field label="Pekerjaan" value={g.occupation} />
                      <Field label="Penghasilan" value={g.income} />
                      <Field label="No. Telepon" value={g.phone} />
                      <Field label="Alamat" value={g.address} />
                    </FieldGrid>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">Belum ada data wali.</p>
            )}
          </Section>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-outline">Data siswa tidak tersedia.</p>
      )}
    </Modal>
  );
}