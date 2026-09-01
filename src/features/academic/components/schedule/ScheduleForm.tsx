import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { scheduleService } from "../../api/schedule.service";
import { classService } from "../../api/class.service";
import { subjectService } from "../../api/subject.service";
import { periodService } from "../../api/period.service";
import { academicYearService } from "../../api/academic-year.service";
import { semesterService } from "../../api/semester.service";
import { teacherService } from "@/features/teachers-staff/api/teacher.service";
import { formatTeacherName, type Teacher } from "@/features/teachers-staff/api/types";
import type {
  AcademicYear,
  CreateSchedulePayload,
  Period,
  Schedule,
  ScheduleDay,
  SchoolClass,
  Semester,
  Subject,
} from "../../api/types";

interface ScheduleFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Schedule | null;
}

const DAY_OPTIONS: Array<{ value: ScheduleDay; label: string }> = [
  { value: "senin", label: "Senin" },
  { value: "selasa", label: "Selasa" },
  { value: "rabu", label: "Rabu" },
  { value: "kamis", label: "Kamis" },
  { value: "jumat", label: "Jumat" },
  { value: "sabtu", label: "Sabtu" },
];

export default function ScheduleForm({
  open,
  onClose,
  onSaved,
  initialData,
}: ScheduleFormProps) {
  const [classId, setClassId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [day, setDay] = useState<ScheduleDay>("senin");
  const [periodId, setPeriodId] = useState<string>("");
  const [academicYearId, setAcademicYearId] = useState<string>("");
  const [semesterId, setSemesterId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [classesError, setClassesError] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState(false);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teachersError, setTeachersError] = useState(false);

  const [periods, setPeriods] = useState<Period[]>([]);
  const [periodsLoading, setPeriodsLoading] = useState(false);
  const [periodsError, setPeriodsError] = useState(false);

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [yearsLoading, setYearsLoading] = useState(false);
  const [yearsError, setYearsError] = useState(false);

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [semestersLoading, setSemestersLoading] = useState(false);
  const [semestersError, setSemestersError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadClasses = useCallback(() => {
    classService
      .list()
      .then((res) => {
        setClasses(res.data);
        setClassesError(false);
      })
      .catch(() => {
        setClassesError(true);
      })
      .finally(() => {
        setClassesLoading(false);
      });
  }, []);

  const loadSubjects = useCallback(() => {
    subjectService
      .list()
      .then((res) => {
        setSubjects(res.data);
        setSubjectsError(false);
      })
      .catch(() => {
        setSubjectsError(true);
      })
      .finally(() => {
        setSubjectsLoading(false);
      });
  }, []);

  const loadTeachers = useCallback(() => {
    teacherService
      .list({ per_page: 100 })
      .then((res) => {
        setTeachers(res.data);
        setTeachersError(false);
      })
      .catch(() => {
        setTeachersError(true);
      })
      .finally(() => {
        setTeachersLoading(false);
      });
  }, []);

  const loadPeriods = useCallback(() => {
    periodService
      .list({ per_page: 100 })
      .then((res) => {
        setPeriods(res.data);
        setPeriodsError(false);
      })
      .catch(() => {
        setPeriodsError(true);
      })
      .finally(() => {
        setPeriodsLoading(false);
      });
  }, []);

  const loadYears = useCallback(() => {
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

  const [previousOpen, setPreviousOpen] = useState(open);
  const [previousInitialData, setPreviousInitialData] = useState(initialData);

  if (open !== previousOpen || initialData !== previousInitialData) {
    setPreviousOpen(open);
    setPreviousInitialData(initialData);

    if (open) {
      setError(null);
      setFieldErrors({});
      setClassesLoading(true);
      setClassesError(false);
      setSubjectsLoading(true);
      setSubjectsError(false);
      setTeachersLoading(true);
      setTeachersError(false);
      setPeriodsLoading(true);
      setPeriodsError(false);
      setYearsLoading(true);
      setYearsError(false);
      setSemestersLoading(true);
      setSemestersError(false);

      if (initialData) {
        setClassId(String(initialData.class_id));
        setSubjectId(String(initialData.subject_id));
        setTeacherId(initialData.teacher_id != null ? String(initialData.teacher_id) : "");
        setDay(initialData.day);
        setPeriodId(String(initialData.period_id));
        setAcademicYearId(String(initialData.academic_year_id));
        setSemesterId(initialData.semester_id != null ? String(initialData.semester_id) : "");
      } else {
        setClassId("");
        setSubjectId("");
        setTeacherId("");
        setDay("senin");
        setPeriodId("");
        setAcademicYearId("");
        setSemesterId("");
      }
    }
  }

  useEffect(() => {
    if (open) {
      loadClasses();
      loadSubjects();
      loadTeachers();
      loadPeriods();
      loadYears();
      loadSemesters();
    }
  }, [open, loadClasses, loadSubjects, loadTeachers, loadPeriods, loadYears, loadSemesters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateSchedulePayload = {
      class_id: Number(classId),
      subject_id: Number(subjectId),
      teacher_id: teacherId ? Number(teacherId) : null,
      day,
      period_id: Number(periodId),
      academic_year_id: Number(academicYearId),
      semester_id: semesterId ? Number(semesterId) : null,
    };

    try {
      if (initialData) {
        await scheduleService.update(initialData.id, payload);
        toast.success("Jadwal berhasil diperbarui.");
      } else {
        await scheduleService.create(payload);
        toast.success("Jadwal berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan jadwal", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const classOptions = classes.map((c) => ({ value: String(c.id), label: c.name }));
  const subjectOptions = subjects.map((s) => ({ value: String(s.id), label: s.name }));
  const teacherOptions = teachers.map((t) => ({ value: String(t.id), label: formatTeacherName(t) }));
  const periodOptions = periods.map((p) => ({
    value: String(p.id),
    label: `${p.name}${p.start_time ? ` (${p.start_time} - ${p.end_time ?? ""})` : ""}`,
  }));
  const yearOptions = years.map((y) => ({ value: String(y.id), label: y.name }));
  const semesterOptions = semesters.map((s) => ({
    value: String(s.id),
    label: `Semester ${s.name}`,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Jadwal" : "Tambah Jadwal"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="schedule-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="schedule-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Kelas" required error={fieldErrors.class_id?.[0]}>
            {classesLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat kelas...
              </div>
            ) : classesError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data kelas.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setClassesLoading(true);
                    setClassesError(false);
                    loadClasses();
                  }}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : classes.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada kelas tersedia.
              </p>
            ) : (
              <AppSelect
                value={classId}
                onChange={(v) => setClassId(v ?? "")}
                options={classOptions}
                placeholder="Pilih Kelas"
                isDisabled={submitting}
              />
            )}
          </FormField>

          <FormField label="Mata Pelajaran" required error={fieldErrors.subject_id?.[0]}>
            {subjectsLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat mata pelajaran...
              </div>
            ) : subjectsError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data mata pelajaran.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSubjectsLoading(true);
                    setSubjectsError(false);
                    loadSubjects();
                  }}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : subjects.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada mata pelajaran tersedia.
              </p>
            ) : (
              <AppSelect
                value={subjectId}
                onChange={(v) => setSubjectId(v ?? "")}
                options={subjectOptions}
                placeholder="Pilih Mata Pelajaran"
                isDisabled={submitting}
              />
            )}
          </FormField>

          <FormField label="Guru" hint="Opsional." error={fieldErrors.teacher_id?.[0]}>
            {teachersLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat guru...
              </div>
            ) : teachersError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data guru.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setTeachersLoading(true);
                    setTeachersError(false);
                    loadTeachers();
                  }}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : teachers.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada guru tersedia.
              </p>
            ) : (
              <AppSelect
                value={teacherId}
                onChange={(v) => setTeacherId(v ?? "")}
                options={teacherOptions}
                placeholder="Pilih Guru"
                isClearable
                isDisabled={submitting}
              />
            )}
          </FormField>

          <FormField label="Hari" required error={fieldErrors.day?.[0]}>
            <AppSelect
              value={day}
              onChange={(v) => setDay((v ?? "senin") as ScheduleDay)}
              options={DAY_OPTIONS}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>

          <FormField label="Jam Pelajaran" required error={fieldErrors.period_id?.[0]}>
            {periodsLoading ? (
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Memuat jam pelajaran...
              </div>
            ) : periodsError ? (
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data jam pelajaran.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                  setPeriodsLoading(true);
                  setPeriodsError(false);
                  loadPeriods();
                }}
                  className="self-start"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : periods.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Tidak ada jam pelajaran tersedia.
              </p>
            ) : (
              <AppSelect
                value={periodId}
                onChange={(v) => setPeriodId(v ?? "")}
                options={periodOptions}
                placeholder="Pilih Jam Pelajaran"
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
                  onClick={() => {
                  setYearsLoading(true);
                  setYearsError(false);
                  loadYears();
                }}
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
                  onClick={() => {
                  setSemestersLoading(true);
                  setSemestersError(false);
                  loadSemesters();
                }}
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