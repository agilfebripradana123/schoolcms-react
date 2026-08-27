import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { studentService } from "../api/student.service";
import { parentService } from "../api/parent.service";
import { guardianService } from "../api/guardian.service";
import type { CreateGuardianPayload, CreateStudentParentPayload, CreateStudentPayload, Student } from "../api/types";

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Student | null;
}

const RELATION_OPTIONS = [
  { value: "ayah", label: "Ayah" },
  { value: "ibu", label: "Ibu" },
  { value: "kakek", label: "Kakek" },
  { value: "nenek", label: "Nenek" },
  { value: "paman", label: "Paman" },
  { value: "bibi", label: "Bibi" },
  { value: "lainnya", label: "Lainnya" },
];

export default function StudentForm({
  open,
  onClose,
  onSaved,
  initialData,
}: StudentFormProps) {
  const isEdit = Boolean(initialData);

  const [nisn, setNisn] = useState("");
  const [nis, setNis] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"L" | "P">("L");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  // Orang tua
  const [parentId, setParentId] = useState<number | null>(null);
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentAddress, setParentAddress] = useState("");

  // Wali
  const [guardianId, setGuardianId] = useState<number | null>(null);
  const [guardianName, setGuardianName] = useState("");
  const [guardianRelation, setGuardianRelation] = useState("ayah");
  const [guardianOccupation, setGuardianOccupation] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianAddress, setGuardianAddress] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setNisn(initialData.nisn ?? "");
        setNis(initialData.nis ?? "");
        setName(initialData.name ?? "");
        setGender(initialData.gender ?? "L");
        setBirthPlace(initialData.birth_place ?? "");
        setBirthDate(initialData.birth_date ? initialData.birth_date.substring(0, 10) : "");
        setAddress(initialData.address ?? "");
        setPhone(initialData.phone ?? "");

        // Muat data orang tua + wali milik siswa ini
        setParentId(null);
        setGuardianId(null);
        Promise.all([parentService.list(), guardianService.list()])
          .then(([parentsRes, guardiansRes]) => {
            const parent = parentsRes.data.find((p) => p.student_id === initialData.id);
            const guardian = guardiansRes.data.find((g) => g.student_id === initialData.id);

            setParentId(parent?.id ?? null);
            setFatherName(parent?.father_name ?? "");
            setMotherName(parent?.mother_name ?? "");
            setFatherOccupation(parent?.father_occupation ?? "");
            setMotherOccupation(parent?.mother_occupation ?? "");
            setParentPhone(parent?.phone ?? "");
            setParentAddress(parent?.address ?? "");

            setGuardianId(guardian?.id ?? null);
            setGuardianName(guardian?.name ?? "");
            setGuardianRelation(guardian?.relation ?? "ayah");
            setGuardianOccupation(guardian?.occupation ?? "");
            setGuardianPhone(guardian?.phone ?? "");
            setGuardianAddress(guardian?.address ?? "");
          })
          .catch(() => setError({ message: "Gagal memuat data orang tua/wali." }));
      } else {
        setNisn("");
        setNis("");
        setName("");
        setGender("L");
        setBirthPlace("");
        setBirthDate("");
        setAddress("");
        setPhone("");
        setParentId(null);
        setFatherName("");
        setMotherName("");
        setFatherOccupation("");
        setMotherOccupation("");
        setParentPhone("");
        setParentAddress("");
        setGuardianId(null);
        setGuardianName("");
        setGuardianRelation("ayah");
        setGuardianOccupation("");
        setGuardianPhone("");
        setGuardianAddress("");
      }
      setError(null);
      setFieldErrors({});
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    // Validasi wajib orang tua & wali
    if (!fatherName.trim() || !motherName.trim()) {
      setError({ message: "Nama ayah dan ibu wajib diisi." });
      setSubmitting(false);
      return;
    }
    if (!guardianName.trim()) {
      setError({ message: "Nama wali wajib diisi." });
      setSubmitting(false);
      return;
    }

    const payload: CreateStudentPayload = {
      nisn: nisn.trim(),
      nis: nis.trim(),
      name: name.trim(),
      gender,
      birth_place: birthPlace.trim(),
      birth_date: birthDate,
      address: address.trim(),
      phone: phone.trim() || undefined,
    };

    const parentPayload: CreateStudentParentPayload = {
      father_name: fatherName.trim(),
      mother_name: motherName.trim(),
      father_occupation: fatherOccupation.trim() || undefined,
      mother_occupation: motherOccupation.trim() || undefined,
      phone: parentPhone.trim() || undefined,
      address: parentAddress.trim() || undefined,
    };

    const guardianPayload: CreateGuardianPayload = {
      name: guardianName.trim(),
      relation: guardianRelation,
      occupation: guardianOccupation.trim() || undefined,
      phone: guardianPhone.trim() || undefined,
      address: guardianAddress.trim() || undefined,
    };

    try {
      let studentId = initialData?.id;

      if (initialData) {
        await studentService.update(initialData.id, payload);
      } else {
        const created = await studentService.create(payload);
        studentId = created.data.id;
      }

      if (!studentId) throw new Error("Gagal mendapatkan ID siswa.");

      if (parentId) {
        await parentService.update(parentId, { ...parentPayload, student_id: studentId });
      } else {
        await parentService.create({ ...parentPayload, student_id: studentId });
      }

      if (guardianId) {
        await guardianService.update(guardianId, { ...guardianPayload, student_id: studentId });
      } else {
        await guardianService.create({ ...guardianPayload, student_id: studentId });
      }

      toast.success(isEdit ? "Data siswa, orang tua, dan wali berhasil diperbarui." : "Data siswa, orang tua, dan wali berhasil ditambahkan.");
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
      title={isEdit ? "Edit Data Siswa" : "Tambah Siswa Baru"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="student-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="student-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Data Siswa */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
            Data Siswa
          </h3>
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="NISN" required error={fieldErrors.nisn?.[0]}>
                <Input
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  placeholder="Contoh: 0012345678"
                  disabled={submitting}
                  maxLength={20}
                />
              </FormField>

              <FormField label="NIS" required error={fieldErrors.nis?.[0]}>
                <Input
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  placeholder="Contoh: 2024001"
                  disabled={submitting}
                  maxLength={20}
                />
              </FormField>
            </div>

            <FormField label="Nama Lengkap" required error={fieldErrors.name?.[0]}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap siswa"
                disabled={submitting}
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

              <FormField label="Tempat Lahir" required error={fieldErrors.birth_place?.[0]}>
                <Input
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="Kota lahir"
                  disabled={submitting}
                />
              </FormField>

              <FormField label="Tanggal Lahir" required error={fieldErrors.birth_date?.[0]}>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  disabled={submitting}
                />
              </FormField>
            </div>

            <FormField label="No. Telepon / WhatsApp" error={fieldErrors.phone?.[0]}>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                disabled={submitting}
              />
            </FormField>

            <FormField label="Alamat Lengkap" required error={fieldErrors.address?.[0]}>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Nama Jalan No. XX, Kelurahan, Kecamatan"
                disabled={submitting}
                rows={3}
              />
            </FormField>
          </div>
        </div>

        {/* Orang Tua */}
        <div className="border-t border-slate-200 pt-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
            Orang Tua
          </h3>
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Nama Ayah" required error={fieldErrors.father_name?.[0]}>
                <Input
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Nama lengkap ayah"
                  disabled={submitting}
                />
              </FormField>

              <FormField label="Nama Ibu" required error={fieldErrors.mother_name?.[0]}>
                <Input
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="Nama lengkap ibu"
                  disabled={submitting}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Pekerjaan Ayah" error={fieldErrors.father_occupation?.[0]}>
                <Input
                  value={fatherOccupation}
                  onChange={(e) => setFatherOccupation(e.target.value)}
                  placeholder="Contoh: PNS, Wiraswasta"
                  disabled={submitting}
                />
              </FormField>

              <FormField label="Pekerjaan Ibu" error={fieldErrors.mother_occupation?.[0]}>
                <Input
                  value={motherOccupation}
                  onChange={(e) => setMotherOccupation(e.target.value)}
                  placeholder="Contoh: Ibu Rumah Tangga"
                  disabled={submitting}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="No. Telepon" error={fieldErrors.phone?.[0]}>
                <Input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="08123456789"
                  disabled={submitting}
                />
              </FormField>

              <FormField label="Alamat" error={fieldErrors.address?.[0]}>
                <Input
                  value={parentAddress}
                  onChange={(e) => setParentAddress(e.target.value)}
                  placeholder="Alamat orang tua (jika beda)"
                  disabled={submitting}
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Wali */}
        <div className="border-t border-slate-200 pt-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
            Wali
          </h3>
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Nama Wali" required error={fieldErrors.name?.[0]}>
                <Input
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Nama lengkap wali"
                  disabled={submitting}
                />
              </FormField>

              <FormField label="Hubungan" required error={fieldErrors.relation?.[0]}>
                <Select
                  value={guardianRelation}
                  onChange={(e) => setGuardianRelation(e.target.value)}
                  options={RELATION_OPTIONS}
                  disabled={submitting}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Pekerjaan" error={fieldErrors.occupation?.[0]}>
                <Input
                  value={guardianOccupation}
                  onChange={(e) => setGuardianOccupation(e.target.value)}
                  placeholder="Contoh: Wiraswasta"
                  disabled={submitting}
                />
              </FormField>

              <FormField label="No. Telepon" error={fieldErrors.phone?.[0]}>
                <Input
                  type="tel"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="08123456789"
                  disabled={submitting}
                />
              </FormField>
            </div>

            <FormField label="Alamat" error={fieldErrors.address?.[0]}>
              <Textarea
                value={guardianAddress}
                onChange={(e) => setGuardianAddress(e.target.value)}
                placeholder="Alamat wali (jika beda)"
                disabled={submitting}
                rows={2}
              />
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