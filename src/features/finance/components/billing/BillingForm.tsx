import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { billingService } from "../../api/billing.service";
import { feeTypeService } from "../../api/fee-type.service";
import { studentService } from "@/features/students/api/student.service";
import { academicYearService } from "@/features/academic/api/academic-year.service";
import { semesterService } from "@/features/academic/api/semester.service";
import type {
  AcademicYear,
  Billing,
  BillingStatus,
  CreateBillingPayload,
  FeeType,
  Semester,
} from "../../api/types";
import type { Student } from "@/features/students/api/types";

interface BillingFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Billing | null;
}

const STATUS_OPTIONS: Array<{ value: BillingStatus; label: string }> = [
  { value: "unpaid", label: "Belum Bayar" },
  { value: "partial", label: "Sebagian" },
  { value: "paid", label: "Lunas" },
  { value: "cancelled", label: "Dibatalkan" },
];

export default function BillingForm({
  open,
  onClose,
  onSaved,
  initialData,
}: BillingFormProps) {
  const [studentId, setStudentId] = useState<string>("");
  const [feeTypeId, setFeeTypeId] = useState<string>("");
  const [academicYearId, setAcademicYearId] = useState<string>("");
  const [semesterId, setSemesterId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<BillingStatus>("unpaid");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(false);

  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [feeTypesLoading, setFeeTypesLoading] = useState(false);
  const [feeTypesError, setFeeTypesError] = useState(false);

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [yearsLoading, setYearsLoading] = useState(false);
  const [yearsError, setYearsError] = useState(false);

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [semestersLoading, setSemestersLoading] = useState(false);
  const [semestersError, setSemestersError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadStudents = useCallback(() => {
    setStudentsLoading(true);
    setStudentsError(false);
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

  const loadFeeTypes = useCallback(() => {
    setFeeTypesLoading(true);
    setFeeTypesError(false);
    feeTypeService
      .list({ per_page: 100 })
      .then((res) => {
        setFeeTypes(res.data);
        setFeeTypesError(false);
      })
      .catch(() => {
        setFeeTypesError(true);
      })
      .finally(() => {
        setFeeTypesLoading(false);
      });
  }, []);

  const loadYears = useCallback(() => {
    setYearsLoading(true);
    setYearsError(false);
    academicYearService
      .list({ per_page: 100 })
      .then((res) => {
        setYears(res.data);
        setYearsError(false);
      })
      .catch(() => {
        setYearsError(true);
      })
      .finally(() => {
        setYearsLoading(false);
      });
  }, []);

  const loadSemesters = useCallback(() => {
    setSemestersLoading(true);
    setSemestersError(false);
    semesterService
      .list({ per_page: 100 })
      .then((res) => {
        setSemesters(res.data);
        setSemestersError(false);
      })
      .catch(() => {
        setSemestersError(true);
      })
      .finally(() => {
        setSemestersLoading(false);
      });
  }, []);

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});
      loadStudents();
      loadFeeTypes();
      loadYears();
      loadSemesters();

      if (initialData) {
        setStudentId(String(initialData.student_id));
        setFeeTypeId(String(initialData.fee_type_id));
        setAcademicYearId(String(initialData.academic_year_id));
        setSemesterId(initialData.semester_id != null ? String(initialData.semester_id) : "");
        setAmount(initialData.amount != null ? String(initialData.amount) : "");
        setDueDate(initialData.due_date ?? "");
        setStatus(initialData.status);
        setNotes(initialData.notes ?? "");
      } else {
        setStudentId("");
        setFeeTypeId("");
        setAcademicYearId("");
        setSemesterId("");
        setAmount("");
        setDueDate("");
        setStatus("unpaid");
        setNotes("");
      }
    }
  }, [open, initialData, loadStudents, loadFeeTypes, loadYears, loadSemesters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const amountNum = Number(amount);
    if (!amount || Number.isNaN(amountNum)) {
      setError({ message: "Jumlah tagihan wajib diisi dengan angka." });
      setSubmitting(false);
      return;
    }
    if (amountNum < 0) {
      setError({ message: "Jumlah tagihan tidak boleh kurang dari 0." });
      setSubmitting(false);
      return;
    }

    const payload: CreateBillingPayload = {
      student_id: Number(studentId),
      fee_type_id: Number(feeTypeId),
      academic_year_id: Number(academicYearId),
      semester_id: semesterId ? Number(semesterId) : null,
      amount: amountNum,
      due_date: dueDate || undefined,
      status,
      notes: notes.trim() || undefined,
    };

    try {
      if (initialData) {
        await billingService.update(initialData.id, payload);
        toast.success("Penagihan berhasil diperbarui.");
      } else {
        await billingService.create(payload);
        toast.success("Penagihan berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan penagihan", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const studentOptions = students.map((s) => ({ value: String(s.id), label: s.name }));
  const feeTypeOptions = feeTypes.map((f) => ({ value: String(f.id), label: f.name }));
  const yearOptions = years.map((y) => ({ value: String(y.id), label: y.name }));
  const semesterOptions = semesters.map((s) => ({
    value: String(s.id),
    label: `Semester ${s.name}`,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Penagihan" : "Tambah Penagihan"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="billing-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="billing-form"
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
                  onClick={loadStudents}
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

          <FormField label="Jenis Tagihan" required error={fieldErrors.fee_type_id?.[0]}>
            {feeTypesLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat jenis tagihan...
              </div>
            ) : feeTypesError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data jenis tagihan.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadFeeTypes}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : feeTypes.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada jenis tagihan tersedia.
              </p>
            ) : (
              <AppSelect
                value={feeTypeId}
                onChange={(v) => setFeeTypeId(v ?? "")}
                options={feeTypeOptions}
                placeholder="Pilih Jenis Tagihan"
                isDisabled={submitting}
              />
            )}
          </FormField>

          <FormField label="Tahun Ajaran" required error={fieldErrors.academic_year_id?.[0]}>
            {yearsLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat tahun ajaran...
              </div>
            ) : yearsError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data tahun ajaran.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadYears}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : years.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada tahun ajaran tersedia.
              </p>
            ) : (
              <AppSelect
                value={academicYearId}
                onChange={(v) => setAcademicYearId(v ?? "")}
                options={yearOptions}
                placeholder="Pilih Tahun Ajaran"
                isDisabled={submitting}
              />
            )}
          </FormField>

          <FormField label="Semester" hint="Opsional." error={fieldErrors.semester_id?.[0]}>
            {semestersLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat semester...
              </div>
            ) : semestersError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data semester.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadSemesters}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : semesters.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada semester tersedia.
              </p>
            ) : (
              <AppSelect
                value={semesterId}
                onChange={(v) => setSemesterId(v ?? "")}
                options={semesterOptions}
                placeholder="Pilih Semester"
                isClearable
                isDisabled={submitting}
              />
            )}
          </FormField>

          <FormField
            label="Jumlah Tagihan"
            required
            hint="Nominal rupiah."
            error={fieldErrors.amount?.[0]}
          >
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="250000"
              disabled={submitting}
            />
          </FormField>

          <FormField label="Jatuh Tempo" hint="Opsional." error={fieldErrors.due_date?.[0]}>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Status" required error={fieldErrors.status?.[0]}>
            <AppSelect
              value={status}
              onChange={(v) => setStatus((v ?? "unpaid") as BillingStatus)}
              options={STATUS_OPTIONS}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>

          <FormField label="Catatan" hint="Opsional." error={fieldErrors.notes?.[0]}>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan penagihan..."
              maxLength={255}
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