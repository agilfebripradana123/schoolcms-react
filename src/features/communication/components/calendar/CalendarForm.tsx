import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { calendarService } from "../../api/calendar.service";
import type {
  Calendar,
  CalendarType,
  CreateCalendarPayload,
} from "../../api/types";
import { academicYearService } from "@/features/academic/api/academic-year.service";
import type { AcademicYear } from "@/features/academic/api/types";

interface CalendarFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Calendar | null;
}

const TypeOptions: { value: CalendarType; label: string }[] = [
  { value: "umum", label: "Umum" },
  { value: "ujian", label: "Ujian" },
  { value: "libur", label: "Libur" },
  { value: "kegiatan", label: "Kegiatan" },
  { value: "rapat", label: "Rapat" },
];

export default function CalendarForm({
  open,
  onClose,
  onSaved,
  initialData,
}: CalendarFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [type, setType] = useState<CalendarType>("umum");
  const [academicYearId, setAcademicYearId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [academicYearsLoading, setAcademicYearsLoading] = useState(false);
  const [academicYearsError, setAcademicYearsError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadAcademicYears = useCallback(() => {
    academicYearService
      .list({ per_page: 100 })
      .then((res) => {
        setAcademicYears(res.data);
        setAcademicYearsError(false);
      })
      .catch(() => {
        setAcademicYearsError(true);
      })
      .finally(() => {
        setAcademicYearsLoading(false);
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
      setAcademicYearsLoading(true);
      setAcademicYearsError(false);

      if (initialData) {
        setTitle(initialData.title ?? "");
        setDescription(initialData.description ?? "");
        setEventDate(initialData.event_date ?? "");
        setType(initialData.type ?? "umum");
        setAcademicYearId(
          initialData.academic_year_id != null
            ? String(initialData.academic_year_id)
            : "",
        );
      } else {
        setTitle("");
        setDescription("");
        setEventDate("");
        setType("umum");
        setAcademicYearId("");
      }
    }
  }

  useEffect(() => {
    if (open) {
      loadAcademicYears();
    }
  }, [open, loadAcademicYears]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateCalendarPayload = {
      title: title.trim(),
      description: description.trim() || null,
      event_date: eventDate,
      type,
      academic_year_id: academicYearId ? Number(academicYearId) : null,
    };

    try {
      if (initialData) {
        await calendarService.update(initialData.id, payload);
        toast.success("Agenda berhasil diperbarui.");
      } else {
        await calendarService.create(payload);
        toast.success("Agenda berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan agenda", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const academicYearOptions = academicYears.map((y) => ({
    value: String(y.id),
    label: y.name,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Agenda" : "Tambah Agenda"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="calendar-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="calendar-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <FormField label="Judul" required error={fieldErrors.title?.[0]}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul agenda"
            maxLength={200}
            disabled={submitting}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="Tanggal"
            required
            error={fieldErrors.event_date?.[0]}
          >
            <Input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Tipe" required error={fieldErrors.type?.[0]}>
            <AppSelect
              value={type}
              onChange={(v) => setType((v ?? "umum") as CalendarType)}
              options={TypeOptions}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>
        </div>

        <FormField
          label="Deskripsi"
          hint="Opsional."
          error={fieldErrors.description?.[0]}
        >
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi agenda..."
            maxLength={2000}
            disabled={submitting}
          />
        </FormField>

        <FormField
          label="Tahun Ajaran"
          hint="Opsional."
          error={fieldErrors.academic_year_id?.[0]}
        >
          {academicYearsLoading ? (
            <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Memuat tahun ajaran...
            </div>
          ) : academicYearsError ? (
            <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
              <span>Gagal memuat tahun ajaran.</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setAcademicYearsLoading(true);
                  setAcademicYearsError(false);
                  loadAcademicYears();
                }}
                className="self-start"
              >
                Muat Ulang
              </Button>
            </div>
          ) : (
            <AppSelect
              value={academicYearId}
              onChange={(v) => setAcademicYearId(v ?? "")}
              options={academicYearOptions}
              placeholder="Pilih Tahun Ajaran"
              isClearable
              isDisabled={submitting}
            />
          )}
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