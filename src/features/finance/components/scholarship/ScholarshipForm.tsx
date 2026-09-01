import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { scholarshipService } from "../../api/scholarship.service";
import { studentService } from "@/features/students/api/student.service";
import type {
  CreateScholarshipPayload,
  Scholarship,
  ScholarshipStatus,
} from "../../api/types";
import type { Student } from "@/features/students/api/types";

interface ScholarshipFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Scholarship | null;
}

const STATUS_OPTIONS: Array<{ value: ScholarshipStatus; label: string }> = [
  { value: "aktif", label: "Aktif" },
  { value: "selesai", label: "Selesai" },
  { value: "dibatalkan", label: "Dibatalkan" },
];

export default function ScholarshipForm({
  open,
  onClose,
  onSaved,
  initialData,
}: ScholarshipFormProps) {
  const [studentId, setStudentId] = useState<string>("");
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<ScholarshipStatus>("aktif");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadStudents = useCallback(() => {
    studentService
      .list({ per_page: 200 })
      .then((res) => {
        setStudents(res.data);
        setStudentsError(false);
      })
      .catch(() => {
        setStudentsError(true);
      })
      .finally(() => {
        setStudentsLoading(false);
      });
  }, []);

  const [previousOpen, setPreviousOpen] = useState(open);
  const [previousInitialData, setPreviousInitialData] = useState(initialData);

  if (open !== previousOpen || initialData !== previousInitialData) {
    setPreviousOpen(open);
    setPreviousInitialData(initialData);

    if (open) {
      setError(null);
      setFieldErrors({});
      setStudentsLoading(true);
      setStudentsError(false);

      if (initialData) {
        setStudentId(String(initialData.student_id));
        setName(initialData.name);
        setProvider(initialData.provider ?? "");
        setAmount(initialData.amount != null ? String(initialData.amount) : "");
        setStartDate(initialData.start_date ?? "");
        setEndDate(initialData.end_date ?? "");
        setStatus(initialData.status);
      } else {
        setStudentId("");
        setName("");
        setProvider("");
        setAmount("");
        setStartDate("");
        setEndDate("");
        setStatus("aktif");
      }
    }
  }

  useEffect(() => {
    if (open) {
      loadStudents();
    }
  }, [open, loadStudents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    let amountNum: number | undefined;
    if (amount !== "") {
      amountNum = Number(amount);
      if (Number.isNaN(amountNum) || amountNum < 0) {
        setError({ message: "Jumlah beasiswa harus angka dan tidak kurang dari 0." });
        setSubmitting(false);
        return;
      }
    }

    const payload: CreateScholarshipPayload = {
      student_id: Number(studentId),
      name: name.trim(),
      provider: provider.trim() || undefined,
      amount: amountNum,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      status,
    };

    try {
      if (initialData) {
        await scholarshipService.update(initialData.id, payload);
        toast.success("Beasiswa berhasil diperbarui.");
      } else {
        await scholarshipService.create(payload);
        toast.success("Beasiswa berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan beasiswa", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const studentOptions = students.map((s) => ({ value: String(s.id), label: s.name }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Beasiswa" : "Tambah Beasiswa"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="scholarship-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="scholarship-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Siswa" required error={fieldErrors.student_id?.[0]}>
            {studentsLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat siswa...
              </div>
            ) : studentsError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data siswa.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setStudentsLoading(true);
                    setStudentsError(false);
                    loadStudents();
                  }}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : students.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada siswa tersedia.
              </p>
            ) : (
              <AppSelect
                value={studentId}
                onChange={(v) => setStudentId(v ?? "")}
                options={studentOptions}
                placeholder="Pilih Siswa"
                isDisabled={submitting}
              />
            )}
          </FormField>

          <FormField label="Nama Beasiswa" required error={fieldErrors.name?.[0]}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Beasiswa Prestasi"
              maxLength={150}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Penyedia" hint="Opsional." error={fieldErrors.provider?.[0]}>
            <Input
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="Contoh: Pemerintah"
              maxLength={150}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Jumlah"
            hint="Opsional. Nominal rupiah."
            error={fieldErrors.amount?.[0]}
          >
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000000"
              disabled={submitting}
            />
          </FormField>

          <FormField label="Mulai" hint="Opsional." error={fieldErrors.start_date?.[0]}>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Berakhir" hint="Opsional." error={fieldErrors.end_date?.[0]}>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Status" required error={fieldErrors.status?.[0]}>
          <AppSelect
            value={status}
            onChange={(v) => setStatus((v ?? "aktif") as ScholarshipStatus)}
            options={STATUS_OPTIONS}
            isSearchable={false}
            isDisabled={submitting}
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