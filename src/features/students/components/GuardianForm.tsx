import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { guardianService } from "../api/guardian.service";
import { studentService } from "../api/student.service";
import type { CreateGuardianPayload, Guardian, Student } from "../api/types";

interface GuardianFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Guardian | null;
}

export default function GuardianForm({
  open,
  onClose,
  onSaved,
  initialData,
}: GuardianFormProps) {
  const isEdit = Boolean(initialData);

  const [studentId, setStudentId] = useState<number | "">("");
  const [students, setStudents] = useState<Student[]>([]);
  const [takenStudentIds, setTakenStudentIds] = useState<Set<number>>(new Set());
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (open) {
      studentService
        .list()
        .then((res) => setStudents(res.data))
        .catch(() => setStudents([]));

      guardianService
        .list()
        .then((res) => setTakenStudentIds(new Set(res.data.map((g) => g.student_id).filter((v): v is number => !!v))))
        .catch(() => setTakenStudentIds(new Set()));
    }
  }, [open]);

  const availableStudents = useMemo(() => {
    if (isEdit && initialData?.student_id) {
      return students.filter(
        (s) => !takenStudentIds.has(s.id) || s.id === initialData.student_id,
      );
    }
    return students.filter((s) => !takenStudentIds.has(s.id));
  }, [students, takenStudentIds, isEdit, initialData?.student_id]);

  useEffect(() => {
    if (open) {
      setStudentId(initialData?.student_id ?? "");
      setName(initialData?.name ?? "");
      setRelation(initialData?.relation ?? "");
      setPhone(initialData?.phone ?? "");
      setOccupation(initialData?.occupation ?? "");
      setAddress(initialData?.address ?? "");
      setError(null);
      setFieldErrors({});
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    if (!studentId) {
      setError({ message: "Pilih siswa terlebih dahulu." });
      setSubmitting(false);
      return;
    }

    const payload: CreateGuardianPayload = {
      student_id: Number(studentId),
      name: name.trim(),
      relation: relation.trim() || undefined,
      phone: phone.trim() || undefined,
      occupation: occupation.trim() || undefined,
      address: address.trim() || undefined,
    };

    try {
      if (initialData) {
        await guardianService.update(initialData.id, payload);
        toast.success("Data wali siswa berhasil diperbarui.");
      } else {
        await guardianService.create(payload);
        toast.success("Data wali siswa berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }

      const msg = (apiError.message ?? "").toLowerCase();
      const isTaken =
        msg.includes("already been taken") ||
        msg.includes("student id") ||
        msg.includes("sudah digunakan") ||
        msg.includes("sudah ada");

      toast.error(
        isTaken
          ? "Data wali untuk siswa ini sudah ada"
          : (apiError.message || "Gagal menyimpan data wali siswa."),
        {
          description: isTaken
            ? "Setiap siswa hanya dapat memiliki satu data wali."
            : undefined,
        },
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Wali Siswa" : "Tambah Wali Siswa"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="guardian-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="guardian-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {initialData?.student ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
            Siswa: <span className="font-semibold text-on-surface">{initialData.student.name}</span>
            {" · "}
            {initialData.student.nisn}
          </div>
        ) : (
          <FormField label="Pilih Siswa" required error={fieldErrors.student_id?.[0]}>
            <Select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value ? Number(e.target.value) : "")}
              options={availableStudents.map((s) => ({
                value: String(s.id),
                label: `${s.name} (${s.nisn || s.nis})`,
              }))}
              placeholder="Pilih siswa (hanya yang belum punya wali)"
              disabled={submitting}
            />
          </FormField>
        )}

        <FormField label="Nama Wali" required error={fieldErrors.name?.[0]}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama lengkap wali"
            disabled={submitting}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Hubungan" error={fieldErrors.relation?.[0]}>
            <Input
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              placeholder="Contoh: Paman, Kakek, Kakak"
              disabled={submitting}
            />
          </FormField>

          <FormField label="Pekerjaan" error={fieldErrors.occupation?.[0]}>
            <Input
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="Contoh: Wiraswasta"
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="No. Telepon" error={fieldErrors.phone?.[0]}>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08123456789"
            disabled={submitting}
          />
        </FormField>

        <FormField label="Alamat" error={fieldErrors.address?.[0]}>
          <Textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Alamat wali siswa"
            disabled={submitting}
            rows={3}
          />
        </FormField>

        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}