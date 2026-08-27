import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { transferService } from "../api/transfer.service";
import { studentService } from "../api/student.service";
import type { CreateTransferPayload, Student, Transfer } from "../api/types";

interface TransferFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Transfer | null;
}

const TYPE_OPTIONS = [
  { value: "masuk", label: "Mutasi Masuk" },
  { value: "keluar", label: "Mutasi Keluar" },
];

export default function TransferForm({
  open,
  onClose,
  onSaved,
  initialData,
}: TransferFormProps) {
  const isEdit = Boolean(initialData);

  const [studentId, setStudentId] = useState<number | "">("");
  const [students, setStudents] = useState<Student[]>([]);
  const [type, setType] = useState("masuk");
  const [fromSchool, setFromSchool] = useState("");
  const [toSchool, setToSchool] = useState("");
  const [transferDate, setTransferDate] = useState(() =>
    new Date().toISOString().substring(0, 10),
  );
  const [reason, setReason] = useState("");
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
      setType(initialData?.type ?? "masuk");
      setFromSchool(initialData?.from_school ?? "");
      setToSchool(initialData?.to_school ?? "");
      setTransferDate(
        initialData?.transfer_date
          ? initialData.transfer_date.substring(0, 10)
          : new Date().toISOString().substring(0, 10),
      );
      setReason(initialData?.reason ?? "");
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

    const payload: CreateTransferPayload = {
      student_id: Number(studentId),
      type: type.trim(),
      from_school: fromSchool.trim() || undefined,
      to_school: toSchool.trim() || undefined,
      transfer_date: transferDate,
      reason: reason.trim() || undefined,
    };

    try {
      if (initialData) {
        await transferService.update(initialData.id, payload);
        toast.success("Mutasi siswa berhasil diperbarui.");
      } else {
        await transferService.create(payload);
        toast.success("Mutasi siswa berhasil dicatat.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error(apiError.message || "Gagal menyimpan mutasi siswa.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Mutasi Siswa" : "Catat Mutasi Siswa"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="transfer-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="transfer-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Jenis Mutasi" required error={fieldErrors.type?.[0]}>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={TYPE_OPTIONS}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Tanggal Mutasi" error={fieldErrors.transfer_date?.[0]}>
            <Input
              type="date"
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Sekolah Asal" error={fieldErrors.from_school?.[0]}>
            <Input
              value={fromSchool}
              onChange={(e) => setFromSchool(e.target.value)}
              placeholder={type === "masuk" ? "Sekolah asal siswa" : "Tidak digunakan (keluar)"}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Sekolah Tujuan" error={fieldErrors.to_school?.[0]}>
            <Input
              value={toSchool}
              onChange={(e) => setToSchool(e.target.value)}
              placeholder={type === "keluar" ? "Sekolah tujuan siswa" : "Tidak digunakan (masuk)"}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Alasan" error={fieldErrors.reason?.[0]}>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: Pindah domisili, mengikuti orang tua, dst."
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