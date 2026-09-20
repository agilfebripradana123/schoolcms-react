import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Archive, ArrowLeft, CheckCircle2, Play, SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import { usePermission } from "@/features/auth/usePermission";
import type { ApiError } from "@/types";
import { examService } from "../api/exam.service";
import { classService } from "@/features/academic/api/class.service";
import { academicYearService } from "@/features/academic/api/academic-year.service";
import { semesterService } from "@/features/academic/api/semester.service";
import type { AcademicYear, SchoolClass, Semester } from "@/features/academic/api/types";
import type { Exam, ExamStatus } from "../api/types";
import ExamComposition from "../components/exam/ExamComposition";
import ExamReportView from "../components/report/ExamReportView";

const STATUS_LABEL: Record<ExamStatus, string> = {
  draft: "Draft",
  published: "Published",
  ongoing: "Berlangsung",
  completed: "Selesai",
  archived: "Diarsipkan",
};

const STATUS_BADGE: Record<ExamStatus, string> = {
  draft: "neutral",
  published: "primary",
  ongoing: "warning",
  completed: "success",
  archived: "secondary",
};

const EXAM_TYPE_LABEL: Record<string, string> = {
  formatif: "Formatif",
  sumatif: "Sumatif",
  uts: "UTS",
  uas: "UAS",
  ujian_sekolah: "Ujian Sekolah",
  remedial: "Remedial",
  other: "Lainnya",
};

type LifecycleTransition = "publish" | "start" | "complete" | "archive";

const TRANSITION_CONFIG: Record<
  LifecycleTransition,
  {
    target: ExamStatus;
    label: string;
    confirmTitle: string;
    confirmDescription: string;
    confirmText: string;
    successMessage: string;
    errorMessage: string;
  }
> = {
  publish: {
    target: "published",
    label: "Terbitkan",
    confirmTitle: "Terbitkan Ujian",
    confirmDescription:
      "Ujian akan diterbitkan dan siap digunakan sesuai lifecycle backend. Validasi kelengkapan komposisi soal tetap dilakukan backend.",
    confirmText: "Terbitkan",
    successMessage: "Ujian berhasil diterbitkan.",
    errorMessage: "Gagal menerbitkan ujian",
  },
  start: {
    target: "ongoing",
    label: "Mulai Ujian",
    confirmTitle: "Mulai Ujian",
    confirmDescription:
      "Status ujian akan berubah menjadi Berlangsung. Peserta dapat mulai mengerjakan ujian sesuai jadwal.",
    confirmText: "Mulai",
    successMessage: "Ujian dimulai.",
    errorMessage: "Gagal memulai ujian",
  },
  complete: {
    target: "completed",
    label: "Selesaikan Ujian",
    confirmTitle: "Selesaikan Ujian",
    confirmDescription:
      "Ujian akan ditutup dan status menjadi Selesai. Data percobaan dan hasil tetap tersimpan; aksi ini tidak memfinalisasi hasil peserta.",
    confirmText: "Selesaikan",
    successMessage: "Ujian selesai.",
    errorMessage: "Gagal menyelesaikan ujian",
  },
  archive: {
    target: "archived",
    label: "Arsipkan Ujian",
    confirmTitle: "Arsipkan Ujian",
    confirmDescription:
      "Ujian akan menjadi Diarsipkan. Data historis tetap tersimpan dan dapat dilihat; status ini bersifat terminal.",
    confirmText: "Arsipkan",
    successMessage: "Ujian diarsipkan.",
    errorMessage: "Gagal mengarsipkan ujian",
  },
};

const TRANSITION_ICON: Record<LifecycleTransition, ComponentType<{ className?: string }>> = {
  publish: SendHorizonal,
  start: Play,
  complete: CheckCircle2,
  archive: Archive,
};

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = usePermission();

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [pendingTransition, setPendingTransition] = useState<LifecycleTransition | null>(null);
  const [activeTransition, setActiveTransition] = useState<LifecycleTransition | null>(null);
  const [publishError, setPublishError] = useState<ApiError | null>(null);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [compositionCount, setCompositionCount] = useState<number | null>(null);
  const [allApproved, setAllApproved] = useState<boolean>(false);

  const examId = id ? Number(id) : NaN;

  const fetchExam = useCallback(() => {
    if (!Number.isFinite(examId)) return;
    let active = true;
    setLoading(true);
    setError(null);

    examService
      .get(examId)
      .then((res) => {
        if (!active) return;
        setExam(res.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(toApiError(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [examId]);

  useEffect(() => {
    return fetchExam();
  }, [fetchExam]);

  useEffect(() => {
    classService
      .list()
      .then((res) => setClasses(res.data))
      .catch(() => setClasses([]));
    academicYearService
      .list({ per_page: 100 })
      .then((res) => setAcademicYears(res.data))
      .catch(() => setAcademicYears([]));
    semesterService
      .list({ per_page: 100 })
      .then((res) => setSemesters(res.data))
      .catch(() => setSemesters([]));
  }, []);

  const nameMap = useMemo(() => {
    const classesMap: Record<number, string> = {};
    for (const c of classes) classesMap[c.id] = c.name;
    const yearsMap: Record<number, string> = {};
    for (const y of academicYears) yearsMap[y.id] = y.name;
    const semestersMap: Record<number, string> = {};
    for (const s of semesters) semestersMap[s.id] = s.name;
    return { classesMap, yearsMap, semestersMap };
  }, [classes, academicYears, semesters]);

  const isDraft = exam?.status === "draft";

  const canManageExams = can("manage-exams");

  const currentTransition: LifecycleTransition | null =
    exam?.status === "draft"
      ? "publish"
      : exam?.status === "published"
        ? "start"
        : exam?.status === "ongoing"
          ? "complete"
          : exam?.status === "completed"
            ? "archive"
            : null;

  const mutating = activeTransition !== null;

  const ActionIcon = currentTransition
    ? TRANSITION_ICON[currentTransition]
    : null;

  const readiness = useMemo(() => {
    const hasQuestions =
      compositionCount !== null && compositionCount > 0;
    const approved =
      compositionCount !== null && compositionCount > 0 && allApproved;
    const academicContext = Boolean(exam?.academic_year_id && exam?.semester_id);
    return [
      {
        key: "questions",
        ok: hasQuestions,
        label: hasQuestions
          ? `${compositionCount} soal terkomposisi`
          : "Belum ada soal terkomposisi",
      },
      {
        key: "approved",
        ok: approved,
        label: approved
          ? "Semua soal berstatus disetujui"
          : "Masih ada soal belum disetujui",
      },
      {
        key: "subject",
        ok: true,
        label: "Soal sesuai mata pelajaran ujian (dijamin backend)",
      },
      {
        key: "context",
        ok: academicContext,
        label: academicContext
          ? "Konteks akademik tersedia"
          : "Tahun ajaran & semester belum diatur",
      },
    ];
  }, [compositionCount, allApproved, exam]);

  const publishReasons = useMemo(() => {
    if (!publishError?.errors) return [];
    const raw = publishError.errors as unknown;
    if (Array.isArray(raw)) return raw as string[];
    if (typeof raw === "object" && raw !== null) {
      return Object.values(raw)
        .flat()
        .filter((v): v is string => typeof v === "string");
    }
    return [];
  }, [publishError]);

  const runTransition = async (transition: LifecycleTransition) => {
    if (!exam || mutating) return;
    const config = TRANSITION_CONFIG[transition];
    setActiveTransition(transition);
    try {
      await examService.update(exam.id, { status: config.target });
      toast.success(config.successMessage);
      setPublishError(null);
      fetchExam();
    } catch (err) {
      const apiError = toApiError(err);
      toast.error(config.errorMessage, {
        description: apiError.message,
      });
      if (config.target === "published") {
        setPublishError(apiError);
      }
    } finally {
      setActiveTransition(null);
    }
  };

  const handleCompositionChange = useCallback(
    (count: number, approved: boolean) => {
      setCompositionCount(count);
      setAllApproved(approved);
    },
    [],
  );

  if (loading) {
    return (
      <PageContainer className="py-6">
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-sm text-outline">
          Memuat detail ujian...
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer className="py-6">
        <Card>
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">{error.message}</p>
            <Button
              variant="secondary"
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchExam();
              }}
            >
              Muat Ulang
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  if (!exam) {
    return (
      <PageContainer className="py-6">
        <Card>
          <div className="py-10 text-center text-sm text-outline">Ujian tidak ditemukan.</div>
        </Card>
      </PageContainer>
    );
  }

  const classId = exam.class_id;
  const yearId = exam.academic_year_id;
  const semesterId = exam.semester_id;

  return (
    <PageContainer className="py-6">
      <PageHeader
        title={exam.title}
        description="Konfigurasi, komposisi soal, dan penerbitan ujian."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/examinations/exams")}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Kembali
            </Button>
            {canManageExams && currentTransition && (
              <Button
                onClick={() => setPendingTransition(currentTransition)}
                loading={activeTransition === currentTransition}
                disabled={mutating}
              >
                {ActionIcon && <ActionIcon className="h-4 w-4" />}
                {TRANSITION_CONFIG[currentTransition].label}
              </Button>
            )}
          </div>
        }
      />

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge
            variant={STATUS_BADGE[exam.status] as "neutral" | "primary" | "warning" | "success" | "secondary"}
          >
            {STATUS_LABEL[exam.status]}
          </Badge>
          <span className="text-sm text-on-surface-variant">
            {exam.subject?.name ?? `Mata Pelajaran #${exam.subject_id}`}
          </span>
          <span className="text-sm text-on-surface-variant">· {exam.duration_minutes} menit</span>
          <span className="text-sm text-on-surface-variant">· Bobot lulus {exam.passing_score}</span>
          <span className="text-sm text-on-surface-variant">· Maks. percobaan {exam.max_attempts}x</span>
        </div>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex justify-between gap-2 border-b border-outline-variant pb-2">
            <dt className="text-on-surface-variant">Kelas</dt>
            <dd className="font-medium text-on-surface">
              {classId != null ? nameMap.classesMap[classId] ?? `#${classId}` : "-"}
            </dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-outline-variant pb-2">
            <dt className="text-on-surface-variant">Tahun Ajaran</dt>
            <dd className="font-medium text-on-surface">
              {yearId != null ? nameMap.yearsMap[yearId] ?? `#${yearId}` : "-"}
            </dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-outline-variant pb-2">
            <dt className="text-on-surface-variant">Semester</dt>
            <dd className="font-medium text-on-surface">
              {semesterId != null ? nameMap.semestersMap[semesterId] ?? `#${semesterId}` : "-"}
            </dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-outline-variant pb-2">
            <dt className="text-on-surface-variant">Tipe Ujian</dt>
            <dd className="font-medium text-on-surface">
              {exam.exam_type ? EXAM_TYPE_LABEL[exam.exam_type] ?? exam.exam_type : "-"}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h3 className="font-semibold text-on-surface">Kesiapan Publikasi</h3>
        <p className="mb-4 text-sm text-on-surface-variant">
          Indikator berdasarkan data lokal. Backend tetap menjadi otoritas validasi saat
          ujian diterbitkan.
        </p>
        <ul className="space-y-2">
          {readiness.map((item) => (
            <li key={item.key} className="flex items-center gap-2 text-sm text-on-surface">
              <CheckCircle2
                className={`h-4 w-4 shrink-0 ${item.ok ? "text-tertiary" : "text-outline"}`}
              />
              <span className={item.ok ? "" : "text-on-surface-variant"}>{item.label}</span>
            </li>
          ))}
        </ul>
        {isDraft ? (
          <>
            {canManageExams && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => setPendingTransition("publish")}
                  loading={activeTransition === "publish"}
                  disabled={mutating}
                >
                  <SendHorizonal className="h-4 w-4" /> Terbitkan Ujian
                </Button>
                <span className="text-xs text-outline">
                  Validasi backend: minimal satu soal disetujui dan sesuai subjek.
                </span>
              </div>
            )}
            {publishError && (
              <div className="mt-4 rounded-xl bg-error-container px-4 py-3 text-sm text-error">
                <p className="font-semibold">{publishError.message}</p>
                {publishReasons.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {publishReasons.map((reason, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-error" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        ) : exam.status === "published" ? (
          <p className="mt-4 text-sm text-on-surface-variant">
            Ujian sudah diterbitkan. Gunakan aksi "Mulai Ujian" untuk mengubah status menjadi
            Berlangsung.
          </p>
        ) : exam.status === "ongoing" ? (
          <p className="mt-4 text-sm text-on-surface-variant">
            Ujian sedang berlangsung. Gunakan aksi "Selesaikan Ujian" untuk menutup ujian.
          </p>
        ) : exam.status === "completed" ? (
          <p className="mt-4 text-sm text-on-surface-variant">
            Ujian telah selesai. Gunakan aksi "Arsipkan Ujian" untuk mengarsipkan.
          </p>
        ) : (
          <p className="mt-4 text-sm text-on-surface-variant">
            Ujian telah diarsipkan dan tidak dapat diubah lagi.
          </p>
        )}
      </Card>

      <ExamComposition
        examId={exam.id}
        subjectId={exam.subject_id}
        mutable={isDraft}
        onCountChange={handleCompositionChange}
      />

      <ExamReportView examId={exam.id} scope="admin" />

      <ConfirmDialog
        open={pendingTransition !== null}
        onOpenChange={(open) => {
          if (!open && !mutating) setPendingTransition(null);
        }}
        title={pendingTransition ? TRANSITION_CONFIG[pendingTransition].confirmTitle : ""}
        description={
          pendingTransition ? TRANSITION_CONFIG[pendingTransition].confirmDescription : ""
        }
        confirmText={pendingTransition ? TRANSITION_CONFIG[pendingTransition].confirmText : "Lanjutkan"}
        cancelText="Batal"
        onConfirm={() => {
          if (!pendingTransition) return;
          const transition = pendingTransition;
          setPendingTransition(null);
          void runTransition(transition);
        }}
      />
    </PageContainer>
  );
}