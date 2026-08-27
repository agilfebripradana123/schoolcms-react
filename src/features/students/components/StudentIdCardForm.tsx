import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Select } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { studentIdCardService } from "../api/student-id-card.service";
import { studentService } from "../api/student.service";
import type { CreateStudentIdCardPayload, Student, StudentIdCard } from "../api/types";

interface StudentIdCardFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: StudentIdCard | null;
}

const STATUS_OPTIONS = [
  { value: "aktif", label: "Aktif" },
  { value: "hilang", label: "Hilang" },
  { value: "rusak", label: "Rusak" },
  { value: "nonaktif", label: "Nonaktif" },
];

export default function StudentIdCardForm({
  open,
  onClose,
  onSaved,
  initialData,
}: StudentIdCardFormProps) {
  const isEdit = Boolean(initialData);

  const [studentId, setStudentId] = useState<number | "">("");
  const [students, setStudents] = useState<Student[]>([]);
  const [cardNumber, setCardNumber] = useState("");
  const [issuedDate, setIssuedDate] = useState(() =>
    new Date().toISOString().substring(0, 10),
  );
  const [validUntil, setValidUntil] = useState("");
  const [status, setStatus] = useState("aktif");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

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

  useEffect(() => {
    if (open) {
      setStudentId(initialData?.student_id ?? "");
      setCardNumber(initialData?.card_number ?? "");
      setIssuedDate(
        initialData?.issued_date
          ? initialData.issued_date.substring(0, 10)
          : new Date().toISOString().substring(0, 10),
      );
      setValidUntil(initialData?.valid_until ? initialData.valid_until.substring(0, 10) : "");
      setStatus(initialData?.status ?? "aktif");
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

    if (!cardNumber.trim()) {
      setError({ message: "Nomor kartu wajib diisi." });
      setSubmitting(false);
      return;
    }

    const payload: CreateStudentIdCardPayload = {
      student_id: Number(studentId),
      card_number: cardNumber.trim(),
      issued_date: issuedDate || undefined,
      valid_until: validUntil || undefined,
      status: status.trim(),
    };

    try {
      if (initialData) {
        await studentIdCardService.update(initialData.id, payload);
        toast.success("Kartu pelajar berhasil diperbarui.");
      } else {
        await studentIdCardService.create(payload);
        toast.success("Kartu pelajar berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error(apiError.message || "Gagal menyimpan kartu pelajar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Kartu Pelajar" : "Tambah Kartu Pelajar"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="id-card-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="id-card-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
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
              options={studentOptions}
              placeholder="Pilih siswa"
              disabled={submitting}
            />
          </FormField>
        )}

        <FormField label="Nomor Kartu" required error={fieldErrors.card_number?.[0]}>
          <Input
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="Contoh: KPS-2024-0001"
            disabled={submitting}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Tanggal Terbit" error={fieldErrors.issued_date?.[0]}>
            <Input
              type="date"
              value={issuedDate}
              onChange={(e) => setIssuedDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Berlaku Sampai" error={fieldErrors.valid_until?.[0]}>
            <Input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Status" required error={fieldErrors.status?.[0]}>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_OPTIONS}
            disabled={submitting}
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