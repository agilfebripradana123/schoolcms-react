import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { teacherService } from "../api/teacher.service";
import type { CreateTeacherPayload, Teacher } from "../api/types";

interface TeacherFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Teacher | null;
}

const EDUCATION_OPTIONS = [
  { value: "SMA", label: "SMA / Sederajat" },
  { value: "D3", label: "D3" },
  { value: "S1", label: "S1" },
  { value: "S2", label: "S2" },
  { value: "S3", label: "S3" },
];

const EMPLOYMENT_OPTIONS = [
  { value: "PNS", label: "PNS" },
  { value: "PPPK", label: "PPPK" },
  { value: "honorer", label: "Honorer" },
  { value: "kontrak", label: "Kontrak" },
  { value: "swasta", label: "Swasta" },
];

const RELIGION_OPTIONS = [
  { value: "islam", label: "Islam" },
  { value: "kristen", label: "Kristen" },
  { value: "katolik", label: "Katolik" },
  { value: "hindu", label: "Hindu" },
  { value: "buddha", label: "Buddha" },
  { value: "konghucu", label: "Konghucu" },
];

export default function TeacherForm({
  open,
  onClose,
  onSaved,
  initialData,
}: TeacherFormProps) {
  const isEdit = Boolean(initialData);

  const [teacherCode, setTeacherCode] = useState("");
  const [nip, setNip] = useState("");
  const [fullName, setFullName] = useState("");
  const [prefixTitle, setPrefixTitle] = useState("");
  const [suffixTitle, setSuffixTitle] = useState("");
  const [gender, setGender] = useState<"L" | "P">("L");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [religion, setReligion] = useState("islam");
  const [lastEducation, setLastEducation] = useState("S1");
  const [major, setMajor] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("honorer");
  const [joinDate, setJoinDate] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Auto-generate kode guru (GR-001..) hanya untuk guru baru
  useEffect(() => {
    if (open && !initialData) {
      let active = true;
      teacherService
        .list({ per_page: 100 })
        .then((res) => {
          if (!active) return;
          const max = res.data.reduce((m, t) => {
            const n = parseInt((t.teacher_code ?? "").replace(/^GR-0*/, ""), 10);
            return Number.isNaN(n) ? m : Math.max(m, n);
          }, 0);
          setTeacherCode(`GR-${String(max + 1).padStart(3, "0")}`);
        })
        .catch(() => {
          // biarkan kode kosong, pengguna tetap bisa mengisi manual
        });
      return () => {
        active = false;
      };
    }
  }, [open, initialData]);

  useEffect(() => {
    if (open) {
      setTeacherCode(initialData?.teacher_code ?? "");
      setNip(initialData?.nip ?? "");
      setFullName(initialData?.full_name ?? "");
      setPrefixTitle(initialData?.prefix_title ?? "");
      setSuffixTitle(initialData?.suffix_title ?? "");
      setGender(initialData?.gender ?? "L");
      setPhone(initialData?.phone ?? "");
      setEmail(initialData?.email ?? "");
      setBirthPlace(initialData?.birth_place ?? "");
      setBirthDate(initialData?.birth_date ? initialData.birth_date.substring(0, 10) : "");
      setReligion(initialData?.religion ?? "islam");
      setLastEducation(initialData?.last_education ?? "S1");
      setMajor(initialData?.major ?? "");
      setEmploymentStatus(initialData?.employment_status ?? "honorer");
      setJoinDate(initialData?.join_date ? initialData.join_date.substring(0, 10) : "");
      setAddress(initialData?.address ?? "");
      setIsActive(initialData?.is_active ?? true);
      setError(null);
      setFieldErrors({});
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    if (!fullName.trim()) {
      setError({ message: "Nama lengkap wajib diisi." });
      setSubmitting(false);
      return;
    }

    const payload: CreateTeacherPayload = {
      teacher_code: teacherCode.trim() || undefined,
      nip: nip.trim() || undefined,
      full_name: fullName.trim(),
      prefix_title: prefixTitle.trim() || undefined,
      suffix_title: suffixTitle.trim() || undefined,
      gender,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      birth_place: birthPlace.trim() || undefined,
      birth_date: birthDate || undefined,
      religion: religion || undefined,
      last_education: lastEducation || undefined,
      major: major.trim() || undefined,
      employment_status: employmentStatus || undefined,
      join_date: joinDate || undefined,
      address: address.trim() || undefined,
      is_active: isActive,
    };

    try {
      if (initialData) {
        await teacherService.update(initialData.id, payload);
      } else {
        await teacherService.create(payload);
      }
      toast.success(
        isEdit
          ? "Data guru berhasil diperbarui."
          : "Data guru berhasil ditambahkan.",
      );
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error(apiError.message || "Gagal menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Data Guru" : "Tambah Guru Baru"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="teacher-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="teacher-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Data Pribadi */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
            Data Pribadi
          </h3>
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {isEdit && (
                <FormField label="Kode Guru" error={fieldErrors.teacher_code?.[0]}>
                  <Input
                    value={teacherCode}
                    onChange={(e) => setTeacherCode(e.target.value)}
                    placeholder="Contoh: GR-001"
                    disabled
                    maxLength={20}
                  />
                </FormField>
              )}

              <FormField label="NIP / NIK" error={fieldErrors.nip?.[0]}>
                <Input
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Nomor Induk Pegawai"
                  disabled={submitting}
                  maxLength={30}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="Gelar Depan" error={fieldErrors.prefix_title?.[0]}>
                <Input
                  value={prefixTitle}
                  onChange={(e) => setPrefixTitle(e.target.value)}
                  placeholder="Contoh: Drs."
                  disabled={submitting}
                />
              </FormField>

              <FormField label="Nama Lengkap" required error={fieldErrors.full_name?.[0]}>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama lengkap guru"
                  disabled={submitting}
                />
              </FormField>

              <FormField label="Gelar Belakang" error={fieldErrors.suffix_title?.[0]}>
                <Input
                  value={suffixTitle}
                  onChange={(e) => setSuffixTitle(e.target.value)}
                  placeholder="Contoh: M.Pd."
                  disabled={submitting}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Jenis Kelamin" required error={fieldErrors.gender?.[0]}>
                <Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "L" | "P")}
                  options={[
                    { value: "L", label: "Laki-laki" },
                    { value: "P", label: "Perempuan" },
                  ]}
                  disabled={submitting}
                />
              </FormField>

              <FormField label="Agama" error={fieldErrors.religion?.[0]}>
                <Select
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  options={RELIGION_OPTIONS}
                  disabled={submitting}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Tempat Lahir" error={fieldErrors.birth_place?.[0]}>
                <Input
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="Kota lahir"
                  disabled={submitting}
                />
              </FormField>

              <FormField label="Tanggal Lahir" error={fieldErrors.birth_date?.[0]}>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  disabled={submitting}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="No. Telepon / WhatsApp" error={fieldErrors.phone?.[0]}>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789"
                  disabled={submitting}
                />
              </FormField>

              <FormField label="Email" error={fieldErrors.email?.[0]}>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@sekolah.sch.id"
                  disabled={submitting}
                />
              </FormField>
            </div>

            <FormField label="Alamat" error={fieldErrors.address?.[0]}>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jalan, kelurahan, kecamatan"
                disabled={submitting}
                rows={2}
              />
            </FormField>
          </div>
        </div>

        {/* Kepegawaian & Pendidikan */}
        <div className="border-t border-slate-200 pt-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
            Kepegawaian & Pendidikan
          </h3>
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Status Kepegawaian" error={fieldErrors.employment_status?.[0]}>
                <Select
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value)}
                  options={EMPLOYMENT_OPTIONS}
                  disabled={submitting}
                />
              </FormField>

              <FormField label="Tanggal Bergabung" error={fieldErrors.join_date?.[0]}>
                <Input
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  disabled={submitting}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Pendidikan Terakhir" error={fieldErrors.last_education?.[0]}>
                <Select
                  value={lastEducation}
                  onChange={(e) => setLastEducation(e.target.value)}
                  options={EDUCATION_OPTIONS}
                  disabled={submitting}
                />
              </FormField>

              <FormField label="Jurusan" error={fieldErrors.major?.[0]}>
                <Input
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="Contoh: Pendidikan Matematika"
                  disabled={submitting}
                />
              </FormField>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-on-surface">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={submitting}
                className="h-4 w-4 rounded border-slate-300 text-primary-container focus:ring-primary-container"
              />
              Guru aktif
            </label>
          </div>
        </div>

        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}