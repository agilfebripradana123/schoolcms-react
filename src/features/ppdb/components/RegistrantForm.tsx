import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { registrationService } from "../api/registration.service";
import type {
  CreateRegistrantPayload,
  Education,
  Gender,
  ProgramChoice,
  RegistrationPath,
  Registrant,
  Religion,
} from "../api/types";

interface RegistrantFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Registrant | null;
}

const RELIGION_OPTIONS: { value: Religion; label: string }[] = [
  { value: "islam", label: "Islam" },
  { value: "kristen", label: "Kristen" },
  { value: "katolik", label: "Katolik" },
  { value: "hindu", label: "Hindu" },
  { value: "buddha", label: "Buddha" },
  { value: "konghucu", label: "Konghucu" },
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];

const PATH_OPTIONS: { value: RegistrationPath; label: string }[] = [
  { value: "prestasi", label: "Prestasi" },
  { value: "reguler", label: "Reguler" },
  { value: "afirmasi", label: "Afirmasi" },
  { value: "mutasi", label: "Mutasi" },
];

const PROGRAM_OPTIONS: { value: ProgramChoice; label: string }[] = [
  { value: "ipa", label: "IPA" },
  { value: "ips", label: "IPS" },
  { value: "bahasa", label: "Bahasa" },
  { value: "lainnya", label: "Lainnya" },
];

const EDUCATION_OPTIONS: { value: Education; label: string }[] = [
  { value: "sd", label: "SD" },
  { value: "smp", label: "SMP" },
  { value: "sma", label: "SMA" },
  { value: "smk", label: "SMK" },
  { value: "d3", label: "D3" },
  { value: "s1", label: "S1" },
  { value: "s2", label: "S2" },
  { value: "s3", label: "S3" },
];

export default function RegistrantForm({
  open,
  onClose,
  onSaved,
  initialData,
}: RegistrantFormProps) {
  const isEdit = Boolean(initialData);

  // Identitas
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<Gender>("L");
  const [nik, setNik] = useState("");
  const [nisn, setNisn] = useState("");
  const [phone, setPhone] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [religion, setReligion] = useState<Religion>("islam");
  // Alamat
  const [address, setAddress] = useState("");
  const [rt, setRt] = useState("");
  const [rw, setRw] = useState("");
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  // Asal sekolah
  const [previousSchool, setPreviousSchool] = useState("");
  const [previousSchoolNpsn, setPreviousSchoolNpsn] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  // PPDB
  const [registrationPath, setRegistrationPath] = useState<RegistrationPath>("reguler");
  const [programChoice, setProgramChoice] = useState<ProgramChoice>("ipa");
  // Orang tua
  const [fatherName, setFatherName] = useState("");
  const [fatherEducation, setFatherEducation] = useState<Education>("sma");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");
  const [motherName, setMotherName] = useState("");
  const [motherEducation, setMotherEducation] = useState<Education>("sma");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [motherPhone, setMotherPhone] = useState("");
  // Wali
  const [guardianName, setGuardianName] = useState("");
  const [guardianEducation, setGuardianEducation] = useState<Education>("sma");
  const [guardianOccupation, setGuardianOccupation] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (open) {
      const d = initialData;
      setFullName(d?.full_name ?? "");
      setEmail(d?.email ?? "");
      setGender(d?.gender ?? "L");
      setNik(d?.nik ?? "");
      setNisn(d?.nisn ?? "");
      setPhone(d?.phone ?? "");
      setBirthPlace(d?.birth_place ?? "");
      setBirthDate(d?.birth_date ? d.birth_date.substring(0, 10) : "");
      setReligion(d?.religion ?? "islam");
      setAddress(d?.address ?? "");
      setRt(d?.rt ?? "");
      setRw(d?.rw ?? "");
      setVillage(d?.village ?? "");
      setDistrict(d?.district ?? "");
      setCity(d?.city ?? "");
      setProvince(d?.province ?? "");
      setPostalCode(d?.postal_code ?? "");
      setPreviousSchool(d?.previous_school ?? "");
      setPreviousSchoolNpsn(d?.previous_school_npsn ?? "");
      setGraduationYear(d?.graduation_year ? String(d.graduation_year) : "");
      setRegistrationPath(d?.registration_path ?? "reguler");
      setProgramChoice(d?.program_choice ?? "ipa");
      setFatherName(d?.father_name ?? "");
      setFatherEducation(d?.father_education ?? "sma");
      setFatherOccupation(d?.father_occupation ?? "");
      setFatherPhone(d?.father_phone ?? "");
      setMotherName(d?.mother_name ?? "");
      setMotherEducation(d?.mother_education ?? "sma");
      setMotherOccupation(d?.mother_occupation ?? "");
      setMotherPhone(d?.mother_phone ?? "");
      setGuardianName(d?.guardian_name ?? "");
      setGuardianEducation(d?.guardian_education ?? "sma");
      setGuardianOccupation(d?.guardian_occupation ?? "");
      setGuardianPhone(d?.guardian_phone ?? "");
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

    const payload: CreateRegistrantPayload = {
      full_name: fullName.trim(),
      email: email.trim() || undefined,
      gender,
      nik: nik.trim() || undefined,
      nisn: nisn.trim() || undefined,
      phone: phone.trim() || undefined,
      birth_place: birthPlace.trim() || undefined,
      birth_date: birthDate || undefined,
      religion,
      address: address.trim() || undefined,
      rt: rt.trim() || undefined,
      rw: rw.trim() || undefined,
      village: village.trim() || undefined,
      district: district.trim() || undefined,
      city: city.trim() || undefined,
      province: province.trim() || undefined,
      postal_code: postalCode.trim() || undefined,
      previous_school: previousSchool.trim() || undefined,
      previous_school_npsn: previousSchoolNpsn.trim() || undefined,
      graduation_year: graduationYear ? Number(graduationYear) : undefined,
      registration_path: registrationPath,
      program_choice: programChoice,
      father_name: fatherName.trim() || undefined,
      father_education: fatherEducation,
      father_occupation: fatherOccupation.trim() || undefined,
      father_phone: fatherPhone.trim() || undefined,
      mother_name: motherName.trim() || undefined,
      mother_education: motherEducation,
      mother_occupation: motherOccupation.trim() || undefined,
      mother_phone: motherPhone.trim() || undefined,
      guardian_name: guardianName.trim() || undefined,
      guardian_education: guardianEducation,
      guardian_occupation: guardianOccupation.trim() || undefined,
      guardian_phone: guardianPhone.trim() || undefined,
    };

    try {
      if (initialData) {
        await registrationService.update(initialData.id, payload);
      } else {
        await registrationService.create(payload);
      }
      toast.success(
        isEdit
          ? "Pendaftaran berhasil diperbarui."
          : "Pendaftaran berhasil ditambahkan.",
      );
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) setFieldErrors(apiError.errors);
      toast.error(apiError.message || "Gagal menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Pendaftaran" : "Tambah Pendaftaran"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="registrant-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="registrant-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Identitas */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
            Identitas
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Nama Lengkap" required error={fieldErrors.full_name?.[0]}>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nama lengkap" disabled={submitting} />
            </FormField>
            <FormField label="Email" error={fieldErrors.email?.[0]}>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.com" disabled={submitting} />
            </FormField>
            <FormField label="Jenis Kelamin" error={fieldErrors.gender?.[0]}>
              <Select value={gender} onChange={(e) => setGender(e.target.value as Gender)} options={GENDER_OPTIONS} disabled={submitting} />
            </FormField>
            <FormField label="NIK" error={fieldErrors.nik?.[0]}>
              <Input value={nik} onChange={(e) => setNik(e.target.value)} placeholder="NIK" disabled={submitting} />
            </FormField>
            <FormField label="NISN" error={fieldErrors.nisn?.[0]}>
              <Input value={nisn} onChange={(e) => setNisn(e.target.value)} placeholder="NISN" disabled={submitting} />
            </FormField>
            <FormField label="Telepon" error={fieldErrors.phone?.[0]}>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telepon" disabled={submitting} />
            </FormField>
            <FormField label="Tempat Lahir" error={fieldErrors.birth_place?.[0]}>
              <Input value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} placeholder="Tempat lahir" disabled={submitting} />
            </FormField>
            <FormField label="Tanggal Lahir" error={fieldErrors.birth_date?.[0]}>
              <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} disabled={submitting} />
            </FormField>
            <FormField label="Agama" error={fieldErrors.religion?.[0]}>
              <Select value={religion} onChange={(e) => setReligion(e.target.value as Religion)} options={RELIGION_OPTIONS} disabled={submitting} />
            </FormField>
          </div>
        </div>

        {/* Alamat */}
        <div className="border-t border-slate-200 pt-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
            Alamat
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Alamat" className="sm:col-span-2" error={fieldErrors.address?.[0]}>
              <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Jalan, RT/RW, kelurahan" disabled={submitting} rows={2} />
            </FormField>
            <FormField label="RT" error={fieldErrors.rt?.[0]}>
              <Input value={rt} onChange={(e) => setRt(e.target.value)} placeholder="RT" disabled={submitting} />
            </FormField>
            <FormField label="RW" error={fieldErrors.rw?.[0]}>
              <Input value={rw} onChange={(e) => setRw(e.target.value)} placeholder="RW" disabled={submitting} />
            </FormField>
            <FormField label="Kelurahan" error={fieldErrors.village?.[0]}>
              <Input value={village} onChange={(e) => setVillage(e.target.value)} placeholder="Kelurahan" disabled={submitting} />
            </FormField>
            <FormField label="Kecamatan" error={fieldErrors.district?.[0]}>
              <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Kecamatan" disabled={submitting} />
            </FormField>
            <FormField label="Kota/Kabupaten" error={fieldErrors.city?.[0]}>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Kota" disabled={submitting} />
            </FormField>
            <FormField label="Provinsi" error={fieldErrors.province?.[0]}>
              <Input value={province} onChange={(e) => setProvince(e.target.value)} placeholder="Provinsi" disabled={submitting} />
            </FormField>
            <FormField label="Kode Pos" error={fieldErrors.postal_code?.[0]}>
              <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Kode pos" disabled={submitting} />
            </FormField>
          </div>
        </div>

        {/* Asal sekolah & PPDB */}
        <div className="border-t border-slate-200 pt-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
            Asal Sekolah & PPDB
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Asal Sekolah" error={fieldErrors.previous_school?.[0]}>
              <Input value={previousSchool} onChange={(e) => setPreviousSchool(e.target.value)} placeholder="Asal sekolah" disabled={submitting} />
            </FormField>
            <FormField label="NPSN Sekolah" error={fieldErrors.previous_school_npsn?.[0]}>
              <Input value={previousSchoolNpsn} onChange={(e) => setPreviousSchoolNpsn(e.target.value)} placeholder="NPSN" disabled={submitting} />
            </FormField>
            <FormField label="Tahun Lulus" error={fieldErrors.graduation_year?.[0]}>
              <Input value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder="2026" disabled={submitting} />
            </FormField>
            <FormField label="Jalur" error={fieldErrors.registration_path?.[0]}>
              <Select value={registrationPath} onChange={(e) => setRegistrationPath(e.target.value as RegistrationPath)} options={PATH_OPTIONS} disabled={submitting} />
            </FormField>
            <FormField label="Pilihan Program" error={fieldErrors.program_choice?.[0]}>
              <Select value={programChoice} onChange={(e) => setProgramChoice(e.target.value as ProgramChoice)} options={PROGRAM_OPTIONS} disabled={submitting} />
            </FormField>
          </div>
        </div>

        {/* Orang tua & wali */}
        <div className="border-t border-slate-200 pt-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
            Orang Tua & Wali
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Nama Ayah" error={fieldErrors.father_name?.[0]}>
              <Input value={fatherName} onChange={(e) => setFatherName(e.target.value)} placeholder="Nama ayah" disabled={submitting} />
            </FormField>
            <FormField label="Pendidikan Ayah" error={fieldErrors.father_education?.[0]}>
              <Select value={fatherEducation} onChange={(e) => setFatherEducation(e.target.value as Education)} options={EDUCATION_OPTIONS} disabled={submitting} />
            </FormField>
            <FormField label="Pekerjaan Ayah" error={fieldErrors.father_occupation?.[0]}>
              <Input value={fatherOccupation} onChange={(e) => setFatherOccupation(e.target.value)} placeholder="Pekerjaan ayah" disabled={submitting} />
            </FormField>
            <FormField label="Telepon Ayah" error={fieldErrors.father_phone?.[0]}>
              <Input value={fatherPhone} onChange={(e) => setFatherPhone(e.target.value)} placeholder="Telepon ayah" disabled={submitting} />
            </FormField>
            <FormField label="Nama Ibu" error={fieldErrors.mother_name?.[0]}>
              <Input value={motherName} onChange={(e) => setMotherName(e.target.value)} placeholder="Nama ibu" disabled={submitting} />
            </FormField>
            <FormField label="Pendidikan Ibu" error={fieldErrors.mother_education?.[0]}>
              <Select value={motherEducation} onChange={(e) => setMotherEducation(e.target.value as Education)} options={EDUCATION_OPTIONS} disabled={submitting} />
            </FormField>
            <FormField label="Pekerjaan Ibu" error={fieldErrors.mother_occupation?.[0]}>
              <Input value={motherOccupation} onChange={(e) => setMotherOccupation(e.target.value)} placeholder="Pekerjaan ibu" disabled={submitting} />
            </FormField>
            <FormField label="Telepon Ibu" error={fieldErrors.mother_phone?.[0]}>
              <Input value={motherPhone} onChange={(e) => setMotherPhone(e.target.value)} placeholder="Telepon ibu" disabled={submitting} />
            </FormField>
            <FormField label="Nama Wali" error={fieldErrors.guardian_name?.[0]}>
              <Input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} placeholder="Nama wali" disabled={submitting} />
            </FormField>
            <FormField label="Pendidikan Wali" error={fieldErrors.guardian_education?.[0]}>
              <Select value={guardianEducation} onChange={(e) => setGuardianEducation(e.target.value as Education)} options={EDUCATION_OPTIONS} disabled={submitting} />
            </FormField>
            <FormField label="Pekerjaan Wali" error={fieldErrors.guardian_occupation?.[0]}>
              <Input value={guardianOccupation} onChange={(e) => setGuardianOccupation(e.target.value)} placeholder="Pekerjaan wali" disabled={submitting} />
            </FormField>
            <FormField label="Telepon Wali" error={fieldErrors.guardian_phone?.[0]}>
              <Input value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} placeholder="Telepon wali" disabled={submitting} />
            </FormField>
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
