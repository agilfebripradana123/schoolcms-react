import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Select } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { alumniService } from "../api/alumni.service";
import { studentService } from "../api/student.service";
import type { Alumni, CreateAlumniPayload, Student } from "../api/types";

interface AlumniFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Alumni | null;
}

export default function AlumniForm({
  open,
  onClose,
  onSaved,
  initialData,
}: AlumniFormProps) {
  const isEdit = Boolean(initialData);

  const [studentId, setStudentId] = useState<number | "">("");
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [occupation, setOccupation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [previousOpen, setPreviousOpen] = useState(open);
  const [previousInitialData, setPreviousInitialData] = useState(initialData);

  if (open !== previousOpen || initialData !== previousInitialData) {
    setPreviousOpen(open);
    setPreviousInitialData(initialData);

    if (open) {
      setStudentId(initialData?.student_id ?? "");
      setName(initialData?.name ?? "");
      setGraduationYear(initialData?.graduation_year ? String(initialData.graduation_year) : "");
      setPhone(initialData?.phone ?? "");
      setEmail(initialData?.email ?? "");
      setOccupation(initialData?.occupation ?? "");
      setError(null);
      setFieldErrors({});
    }
  }

  useEffect(() => {
    if (open && !isEdit) {
      studentService
        .list()
        .then((res) => setStudents(res.data))
        .catch(() => setStudents([]));
    }
  }, [open, isEdit]);

  const studentOptions = useMemo(
    () =>
      [...students]
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "id"))
        .map((s) => ({
          value: String(s.id),
          label: `${s.name} (${s.nisn || s.nis})`,
        })),
    [students],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    if (!name.trim()) {
      setError({ message: "Nama alumni wajib diisi." });
      setSubmitting(false);
      return;
    }

    if (!graduationYear.trim()) {
      setError({ message: "Tahun lulus wajib diisi." });
      setSubmitting(false);
      return;
    }

    const payload: CreateAlumniPayload = {
      student_id: studentId ? Number(studentId) : undefined,
      name: name.trim(),
      graduation_year: Number(graduationYear),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      occupation: occupation.trim() || undefined,
    };

    try {
      if (initialData) {
        await alumniService.update(initialData.id, payload);
        toast.success("Alumni berhasil diperbarui.");
      } else {
        await alumniService.create(payload);
        toast.success("Alumni berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error(apiError.message || "Gagal menyimpan alumni.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Alumni" : "Tambah Alumni"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="alumni-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="alumni-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {initialData?.student ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
            Siswa: <span className="font-semibold text-on-surface">{initialData.student.name}</span>
            {" · "}
            {initialData.student.nisn}
          </div>
        ) : (
          <FormField label="Siswa (opsional)" error={fieldErrors.student_id?.[0]}>
            <Select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value ? Number(e.target.value) : "")}
              options={studentOptions}
              placeholder="Pilih siswa"
              disabled={submitting}
            />
          </FormField>
        )}

        <FormField label="Nama Alumni" required error={fieldErrors.name?.[0]}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama lengkap alumni"
            disabled={submitting}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Tahun Lulus" required error={fieldErrors.graduation_year?.[0]}>
            <Input
              type="number"
              min={2000}
              max={2100}
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              placeholder="Contoh: 2024"
              disabled={submitting}
            />
          </FormField>

          <FormField label="Pekerjaan" error={fieldErrors.occupation?.[0]}>
            <Input
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="Contoh: Software Engineer"
              disabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="No. Telepon" error={fieldErrors.phone?.[0]}>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 0812xxxxxxx"
              disabled={submitting}
            />
          </FormField>

          <FormField label="Email" error={fieldErrors.email?.[0]}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alumni@email.com"
              disabled={submitting}
            />
          </FormField>
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