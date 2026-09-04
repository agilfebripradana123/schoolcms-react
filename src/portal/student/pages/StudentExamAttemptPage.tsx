import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, WifiOff, AlertTriangle, Loader2, Timer } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { studentExamAttemptService } from "@/features/examinations/api/student-exam-attempt.service";
import type {
  ExamAttemptInfo,
  SecureExamQuestion,
  SecureExamSubmitData,
} from "@/features/examinations/api/student-exam-attempt.service";
import { toApiError } from "@/lib/api";

type AnswerStatus = "idle" | "saving" | "saved" | "error";

function formatRemaining(ms: number): string {
  if (ms < 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function StudentExamAttemptPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<ExamAttemptInfo | null>(null);
  const [questions, setQuestions] = useState<SecureExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [essays, setEssays] = useState<Record<string, string>>({});
  const [answerStatus, setAnswerStatus] = useState<Record<string, AnswerStatus>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const [offline, setOffline] = useState(false);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [done, setDone] = useState<SecureExamSubmitData | null>(null);

  const didAutoSubmit = useRef(false);
  const lastStatus = useRef<AnswerStatus>("saved");

  // ---- Load / resume -------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [attemptRes, questionsRes] = await Promise.all([
          studentExamAttemptService.getAttempt(attemptId!),
          studentExamAttemptService.getQuestions(attemptId!),
        ]);
        if (cancelled) return;
        setAttempt(attemptRes.data?.attempt ?? null);
        if (attemptRes.data?.answers) {
          const selected: Record<string, number | null> = {};
          const essay: Record<string, string> = {};
          for (const [qid, a] of Object.entries(attemptRes.data.answers)) {
            selected[qid] = a.selected_option_id;
            essay[qid] = a.essay_answer ?? "";
          }
          setAnswers(selected);
          setEssays(essay);
        }
        setQuestions(questionsRes.data?.questions ?? []);
        const at = attemptRes.data?.attempt;
        if (at?.expires_at) {
          setRemainingMs(new Date(at.expires_at).getTime() - Date.now());
        }
      } catch (err) {
        if (!cancelled) setLoadError(toApiError(err).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  // ---- Countdown (visualization only; server is authority) ----------
  useEffect(() => {
    if (remainingMs === null) return;
    const id = setInterval(() => {
      setRemainingMs(new Date((attempt?.expires_at as string) ?? Date.now()).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.expires_at, remainingMs === null]);

  const effectiveRemaining = useMemo(() => {
    if (!attempt?.expires_at) return null;
    const ms = new Date(attempt.expires_at).getTime() - Date.now();
    return Math.max(0, ms);
  }, [attempt?.expires_at, remainingMs]);

  // ---- Auto-submit on expiry (only if active) -----------------------
  useEffect(() => {
    if (!attempt || expired || didAutoSubmit.current || attempt.status !== "active") return;
    if (attempt.expires_at && Date.now() >= new Date(attempt.expires_at).getTime()) {
      setExpired(true);
      didAutoSubmit.current = true;
      handleSubmit(true).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveRemaining, attempt]);

  // ---- Fullscreen ----------------------------------------------------
  const enterFullscreen = useCallback(() => {
    const el = document.documentElement;
    try {
      if (el.requestFullscreen) void el.requestFullscreen();
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!started) return;
    const onFsChange = () => {
      if (!document.fullscreenElement && attempt?.status === "active") {
        void studentExamAttemptService
          .logEvent(attempt.id, { event_type: "fullscreen_exit" })
          .catch(() => {});
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [started, attempt?.id, attempt?.status]);

  // ---- Tab switch ----------------------------------------------------
  useEffect(() => {
    if (!started || !attempt) return;
    const onVis = () => {
      if (document.visibilityState === "hidden" && attempt.status === "active") {
        void studentExamAttemptService
          .logEvent(attempt.id, { event_type: "tab_switch" })
          .catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [started, attempt?.id, attempt?.status]);

  // ---- Online / offline ---------------------------------------------
  useEffect(() => {
    if (!started || !attempt) return;
    const onOffline = () => setOffline(true);
    const onOnline = () => {
      setOffline(false);
      void studentExamAttemptService.logEvent(attempt.id, { event_type: "reconnect" }).catch(() => {});
      // Re-sync with server (resume / refresh saved answers).
      void studentExamAttemptService
        .getAttempt(attempt.id)
        .then((res) => {
          if (res.data?.answers) {
            const selected: Record<string, number | null> = {};
            for (const [qid, a] of Object.entries(res.data.answers)) selected[qid] = a.selected_option_id;
            setAnswers((prev) => ({ ...prev, ...selected }));
          }
        })
        .catch(() => {});
    };
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [started, attempt?.id]);

  // ---- Warn before leaving while active -----------------------------
  useEffect(() => {
    if (!started || !attempt || attempt.status !== "active") return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [started, attempt?.id, attempt?.status]);

  // ---- Autosave on option selected ----------------------------------
  const saveAnswer = useCallback(
    async (questionId: number, selectedId: number | null, essay?: string) => {
      if (!attempt) return;
      const key = String(questionId);
      setAnswerStatus((p) => ({ ...p, [key]: "saving" }));
      try {
        await studentExamAttemptService.saveAnswer(attempt.id, questionId, {
          selected_option_id: selectedId,
          essay_answer: essay ?? undefined,
        });
        lastStatus.current = "saved";
        setAnswerStatus((p) => ({ ...p, [key]: "saved" }));
      } catch (err) {
        lastStatus.current = "error";
        setAnswerStatus((p) => ({ ...p, [key]: "error" }));
        // Local answer kept; server remains source of truth on next sync.
        toast.error("Jawaban belum tersimpan", { description: toApiError(err).message });
      }
    },
    [attempt],
  );

  const selectOption = (question: SecureExamQuestion, optionId: number) => {
    setAnswers((p) => ({ ...p, [String(question.id)]: optionId }));
    void saveAnswer(question.id, optionId);
  };

  const changeEssay = (question: SecureExamQuestion, value: string) => {
    setEssays((p) => ({ ...p, [String(question.id)]: value }));
    void saveAnswer(question.id, null, value);
  };

  // ---- Submit -------------------------------------------------------
  const handleSubmit = useCallback(
    async (forceExpired = false) => {
      if (!attempt) return;
      setSubmitting(true);
      try {
        const res = await studentExamAttemptService.submit(attempt.id);
        setDone(res.data ?? null);
        setSubmitOpen(false);
      } catch (err) {
        const msg = toApiError(err).message;
        if (!forceExpired) toast.error("Gagal mengumpulkan ujian", { description: msg });
      } finally {
        setSubmitting(false);
      }
    },
    [attempt],
  );

  const currentQuestion = questions[currentIndex];
  const answeredCount = questions.filter((q) => {
    const k = String(q.id);
    return answers[k] != null || (essays[k] ?? "").trim() !== "";
  }).length;

  // ---- Render branches ----------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-error" />
          <h1 className="mt-4 text-lg font-bold text-on-surface">Tidak dapat membuka ujian</h1>
          <p className="mt-2 text-sm text-on-surface-variant">{loadError}</p>
          <Button variant="secondary" className="mt-6" onClick={() => navigate("/siswa/exams")}>
            Kembali ke Ujian
          </Button>
        </div>
      </div>
    );
  }

  // Completed view.
  if (done) {
    const result = done.result;
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-4 text-xl font-bold text-on-surface">Ujian Selesai</h1>
          <p className="mt-1 text-sm text-on-surface-variant">Terima kasih. Jawaban Anda telah dikumpulkan.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-left">
            <div className="rounded-xl bg-surface-container-high p-3">
              <p className="text-xs text-on-surface-variant">Nilai</p>
              <p className="text-lg font-bold text-on-surface">{result.total_score}</p>
            </div>
            <div className="rounded-xl bg-surface-container-high p-3">
              <p className="text-xs text-on-surface-variant">Huruf</p>
              <p className="text-lg font-bold text-on-surface">{result.grade ?? "-"}</p>
            </div>
            <div className="rounded-xl bg-surface-container-high p-3">
              <p className="text-xs text-on-surface-variant">Benar</p>
              <p className="text-lg font-bold text-success">{result.correct_count}</p>
            </div>
            <div className="rounded-xl bg-surface-container-high p-3">
              <p className="text-xs text-on-surface-variant">Salah / Kosong</p>
              <p className="text-lg font-bold text-error">{result.wrong_count + result.unanswered_count}</p>
            </div>
          </div>
          <Button className="mt-6" onClick={() => navigate("/siswa/exams")}>
            Lihat Hasil
          </Button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-on-surface">Siap mengerjakan ujian?</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Ujian akan dimulai dalam mode layar penuh. Anda tidak boleh berpindah tab atau keluar
            dari layar penuh selama ujian berlangsung. Semua jawaban disimpan otomatis.
          </p>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-container-high p-4">
            <div>
              <p className="text-xs text-on-surface-variant">Sisa waktu</p>
              <p className="text-lg font-bold text-on-surface">{formatRemaining(effectiveRemaining ?? 0)}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Nomor soal</p>
              <p className="text-lg font-bold text-on-surface">{questions.length}</p>
            </div>
          </div>
          <Button
            className="mt-6 w-full"
            onClick={() => {
              enterFullscreen();
              setStarted(true);
            }}
          >
            Mulai Mengerjakan
          </Button>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Timer className="mx-auto h-12 w-12 text-error" />
          <h1 className="mt-4 text-xl font-bold text-on-surface">Waktu Habis</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Waktu pengerjaan telah berakhir. Ujian sedang dikumpulkan secara otomatis.
          </p>
          {submitting && <Loader2 className="mx-auto mt-4 h-6 w-6 animate-spin text-primary" />}
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <p className="text-sm text-on-surface-variant">Tidak ada soal.</p>
      </div>
    );
  }

  const qKey = String(currentQuestion.id);
  const selected = answers[qKey] ?? null;
  const questionStatus = answerStatus[qKey] ?? "idle";

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-on-surface">Ujian</span>
          <Badge variant="neutral">Percobaan {attempt?.attempt_number}</Badge>
        </div>
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
            effectiveRemaining !== null && effectiveRemaining < 60_000
              ? "bg-error-container text-error"
              : "bg-surface-container-high text-on-surface"
          }`}
        >
          <Timer className="h-4 w-4" />
          {formatRemaining(effectiveRemaining ?? 0)}
        </div>
        <div className="flex items-center gap-2">
          {offline && (
            <span className="flex items-center gap-1 rounded-full bg-error-container px-2 py-0.5 text-xs text-error">
              <WifiOff className="h-3.5 w-3.5" /> Offline
            </span>
          )}
          <Button size="sm" onClick={() => setSubmitOpen(true)}>
            Kumpulkan
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-5 p-5 lg:flex-row">
        {/* Question number grid */}
        <aside className="order-2 w-full shrink-0 lg:order-1 lg:w-56">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Navigasi Soal
            </p>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const k = String(q.id);
                const isAnswered = answers[k] != null || (essays[k] ?? "").trim() !== "";
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-primary text-on-primary ring-2 ring-primary/40"
                        : isAnswered
                          ? "bg-primary-container text-on-primary"
                          : "border border-slate-200 bg-white text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 space-y-1.5 text-xs text-on-surface-variant">
              <p className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-primary" /> Dijawab
              </p>
              <p className="flex items-center gap-2">
                <span className="h-3 w-3 rounded border border-slate-300 bg-white" /> Belum dijawab
              </p>
            </div>
          </div>
        </aside>

        {/* Question body */}
        <section className="order-1 flex-1 lg:order-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <Badge variant="secondary">Soal {currentIndex + 1} dari {questions.length}</Badge>
              <span className="text-xs text-on-surface-variant">{currentQuestion.points} poin</span>
            </div>
            <h2 className="text-base font-semibold leading-relaxed text-on-surface">
              {currentQuestion.question_text}
            </h2>

            <div className="mt-6 space-y-3">
              {currentQuestion.type === "essay" ? (
                <textarea
                  value={essays[qKey] ?? ""}
                  onChange={(e) => changeEssay(currentQuestion, e.target.value)}
                  rows={6}
                  placeholder="Tulis jawaban Anda di sini..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-primary-container focus:outline-none"
                />
              ) : (
                currentQuestion.options.map((opt) => {
                  const isSel = selected === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => selectOption(currentQuestion, opt.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors ${
                        isSel
                          ? "border-primary bg-primary-container/40"
                          : "border-slate-200 bg-white hover:bg-surface-container-high"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          isSel ? "border-primary bg-primary" : "border-slate-300"
                        }`}
                      >
                        {isSel && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                      <span className="text-on-surface">{opt.option_text}</span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Save status */}
            <div className="mt-5 flex items-center gap-2 text-xs text-on-surface-variant">
              {questionStatus === "saving" && (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Menyimpan...
                </span>
              )}
              {questionStatus === "saved" && <span className="text-success">Tersimpan</span>}
              {questionStatus === "error" && <span className="text-error">Gagal menyimpan</span>}
            </div>
          </div>

          {/* Prev / next */}
          <div className="mt-5 flex items-center justify-between">
            <Button
              variant="secondary"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            >
              Sebelumnya
            </Button>
            {currentIndex < questions.length - 1 ? (
              <Button onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}>
                Selanjutnya
              </Button>
            ) : (
              <Button onClick={() => setSubmitOpen(true)}>Kumpulkan</Button>
            )}
          </div>
        </section>
      </main>

      {/* Submit confirmation */}
      <Modal
        open={submitOpen}
        onClose={() => !submitting && setSubmitOpen(false)}
        title="Kumpulkan ujian?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSubmitOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={() => handleSubmit()} loading={submitting}>
              Ya, kumpulkan
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-on-surface-variant">
          <p>Apakah Anda yakin ingin mengakhiri ujian sekarang?</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-container-high p-3">
              <p className="text-xs text-on-surface-variant">Sudah dijawab</p>
              <p className="text-lg font-bold text-success">{answeredCount}</p>
            </div>
            <div className="rounded-xl bg-surface-container-high p-3">
              <p className="text-xs text-on-surface-variant">Belum dijawab</p>
              <p className="text-lg font-bold text-error">{questions.length - answeredCount}</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
