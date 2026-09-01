import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { parentService } from "../api/parent.service";
import { studentService } from "../api/student.service";
import type { CreateStudentParentPayload, Student, StudentParent } from "../api/types";

interface ParentFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: StudentParent | null;
}

export default function ParentForm({
  open,
  onClose,
  onSaved,
  initialData,
}: ParentFormProps) {
  const isEdit = Boolean(initialData);

  const [studentId, setStudentId] = useState<number | "">("");
  const [students, setStudents] = useState<Student[]>([]);
  const [takenStudentIds, setTakenStudentIds] = useState<Set<number>>(new Set());
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
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
      setFatherName(initialData?.father_name ?? "");
      setMotherName(initialData?.mother_name ?? "");
      setFatherOccupation(initialData?.father_occupation ?? "");
      setMotherOccupation(initialData?.mother_occupation ?? "");
      setPhone(initialData?.phone ?? "");
      setAddress(initialData?.address ?? "");
      setError(null);
      setFieldErrors({});
    }
  }

  useEffect(() => {
    if (open) {
      // Ambil siswa + orang tua yang sudah ada sekaligus untuk filter
      studentService
        .list()
        .then((res) => setStudents(res.data))
        .catch(() => setStudents([]));

      parentService
        .list()
        .then((res) => setTakenStudentIds(new Set(res.data.map((p) => p.student_id).filter((v): v is number => !!v))))
        .catch(() => setTakenStudentIds(new Set()));
    }
  }, [open]);

  const availableStudents = useMemo(() => {
    if (isEdit && initialData?.student_id) {
      // Saat edit, tetap tampilkan siswa yang sedang diedit
      return students.filter(
        (s) => !takenStudentIds.has(s.id) || s.id === initialData.student_id,
      );
    }
    return students.filter((s) => !takenStudentIds.has(s.id));
  }, [students, takenStudentIds, isEdit, initialData]);

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

    const payload: CreateStudentParentPayload = {
      student_id: Number(studentId),
      father_name: fatherName.trim() || undefined,
      mother_name: motherName.trim() || undefined,
      father_occupation: fatherOccupation.trim() || undefined,
      mother_occupation: motherOccupation.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
    };

    try {
      if (initialData) {
        await parentService.update(initialData.id, payload);
        toast.success("Data orang tua berhasil diperbarui.");
      } else {
        await parentService.create(payload);
        toast.success("Data orang tua berhasil ditambahkan.");
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
          ? "Data orang tua untuk siswa ini sudah ada"
          : (apiError.message || "Gagal menyimpan data orang tua."),
        {
          description: isTaken
            ? "Setiap siswa hanya dapat memiliki satu data orang tua."
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
      title={isEdit ? "Edit Orang Tua" : "Tambah Orang Tua"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="parent-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="parent-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
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
              placeholder="Pilih siswa (hanya yang belum punya orang tua)"
              disabled={submitting}
            />
          </FormField>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nama Ayah" error={fieldErrors.father_name?.[0]}>
            <Input
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              placeholder="Nama lengkap ayah"
              disabled={submitting}
            />
          </FormField>

          <FormField label="Nama Ibu" error={fieldErrors.mother_name?.[0]}>
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
            placeholder="Alamat orang tua"
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