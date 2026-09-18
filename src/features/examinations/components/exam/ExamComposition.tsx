import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { FormField, Input } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { examQuestionService } from "../../api/exam-question.service";
import { questionBankService } from "../../api/question.service";
import type { ExamQuestion, QuestionBank, QuestionType } from "../../api/types";

const TYPE_LABEL: Record<QuestionType, string> = {
  multiple_choice: "Pilihan Ganda",
  true_false: "Benar/Salah",
  essay: "Esai",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  approved: "Disetujui",
  archived: "Diarsipkan",
};

const STATUS_BADGE: Record<string, "neutral" | "success" | "secondary"> = {
  draft: "neutral",
  approved: "success",
  archived: "secondary",
};

function truncate(text: string, max = 90): string {
  if (!text) return "-";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

interface ExamCompositionProps {
  examId: number;
  subjectId: number;
  mutable: boolean;
  onCountChange?: (count: number, allApproved: boolean) => void;
}

export default function ExamComposition({
  examId,
  subjectId,
  mutable,
  onCountChange,
}: ExamCompositionProps) {
  const [compositions, setCompositions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [orderIds, setOrderIds] = useState<number[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [bankQuestions, setBankQuestions] = useState<QuestionBank[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");
  const [adding, setAdding] = useState(false);

  const [pointsTarget, setPointsTarget] = useState<ExamQuestion | null>(null);
  const [pointsInput, setPointsInput] = useState("");
  const [savingPoints, setSavingPoints] = useState(false);

  const [removeTarget, setRemoveTarget] = useState<ExamQuestion | null>(null);

  const fetchComposition = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);

    examQuestionService
      .list(examId)
      .then((res) => {
        if (!active) return;
        setCompositions(res.data);
        setOrderIds(res.data.map((c) => c.id));
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
    return fetchComposition();
  }, [fetchComposition]);

  const byId = useMemo(() => {
    const map: Record<number, ExamQuestion> = {};
    for (const c of compositions) map[c.id] = c;
    return map;
  }, [compositions]);

  useEffect(() => {
    onCountChange?.(
      compositions.length,
      compositions.every((c) => c.question?.status === "approved"),
    );
  }, [compositions, onCountChange]);

  const ordered = useMemo(
    () =>
      orderIds
        .map((id) => byId[id])
        .filter((c): c is ExamQuestion => c !== undefined),
    [orderIds, byId],
  );

  const openAdd = useCallback(() => {
    setSelectedQuestionId("");
    setBankQuestions([]);
    setAddOpen(true);

    questionBankService
      .list({ subject_id: subjectId, per_page: 100 })
      .then((res) => {
        const composedIds = new Set(compositions.map((c) => c.question_id));
        setBankQuestions(
          res.data.filter(
            (q) => q.status === "approved" && !composedIds.has(q.id),
          ),
        );
      })
      .catch((err) => {
        toast.error("Gagal memuat bank soal", {
          description: toApiError(err).message,
        });
      });
  }, [subjectId, compositions]);

  const handleAdd = async () => {
    if (!selectedQuestionId) {
      toast.error("Pilih soal terlebih dahulu.");
      return;
    }
    setAdding(true);
    try {
      await examQuestionService.add(examId, {
        question_id: Number(selectedQuestionId),
      });
      toast.success("Soal ditambahkan ke ujian.");
      setAddOpen(false);
      fetchComposition();
    } catch (err) {
      const apiError = toApiError(err);
      toast.error("Gagal menambahkan soal", {
        description: apiError.message,
      });
    } finally {
      setAdding(false);
    }
  };

  const move = useCallback((index: number, dir: -1 | 1) => {
    setOrderIds((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const current = next[index];
      const other = next[target];
      if (current === undefined || other === undefined) return prev;
      next[index] = other;
      next[target] = current;
      return next;
    });
  }, []);

  const handleReorder = async () => {
    if (orderIds.length < 2) return;
    setSavingOrder(true);
    try {
      await examQuestionService.reorder(examId, orderIds);
      toast.success("Urutan soal disimpan.");
      fetchComposition();
    } catch (err) {
      const apiError = toApiError(err);
      toast.error("Gagal menyimpan urutan soal", {
        description: apiError.message,
      });
    } finally {
      setSavingOrder(false);
    }
  };

  const openEditPoints = (row: ExamQuestion) => {
    setPointsTarget(row);
    setPointsInput(String(row.points));
  };

  const handleSavePoints = async () => {
    if (!pointsTarget) return;
    const value = Number(pointsInput);
    if (!Number.isInteger(value) || value < 1) {
      toast.error("Bobot harus berupa bilangan bulat minimal 1.");
      return;
    }
    setSavingPoints(true);
    try {
      await examQuestionService.update(examId, pointsTarget.id, { points: value });
      toast.success("Bobot soal diperbarui.");
      setPointsTarget(null);
      fetchComposition();
    } catch (err) {
      const apiError = toApiError(err);
      toast.error("Gagal memperbarui bobot soal", {
        description: apiError.message,
      });
    } finally {
      setSavingPoints(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      await examQuestionService.remove(examId, removeTarget.id);
      toast.warning("Soal dihapus dari ujian.");
      setRemoveTarget(null);
      fetchComposition();
    } catch (err) {
      const apiError = toApiError(err);
      toast.error("Gagal menghapus soal dari ujian", {
        description: apiError.message,
      });
    }
  };

  const questionOptions = useMemo(
    () =>
      bankQuestions.map((q) => ({
        value: String(q.id),
        label: truncate(q.question_text, 80),
      })),
    [bankQuestions],
  );

  const columns = useMemo(() => {
    type Row = ExamQuestion;
    return [
      {
        header: "No",
        accessor: "position" as keyof Row,
        className: "px-6 py-4 text-center text-sm text-on-surface-variant",
        render: (_value: Row[keyof Row], row: Row) => <span>{row.position}</span>,
      },
      {
        header: "Soal",
        accessor: "question_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <div>
            <p className="line-clamp-2 max-w-[360px] text-sm font-medium text-on-surface">
              {row.question?.question_text ?? `#${row.question_id}`}
            </p>
            {row.question?.code && (
              <p className="text-xs text-on-surface-variant">
                Kode: {row.question.code}
              </p>
            )}
          </div>
        ),
      },
      {
        header: "Tipe",
        accessor: "question_id" as keyof Row,
        className: "px-6 py-4 text-center text-sm text-on-surface",
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-on-surface">
            {row.question ? TYPE_LABEL[row.question.type] ?? row.question.type : "-"}
          </span>
        ),
      },
      {
        header: "Status Soal",
        accessor: "question_id" as keyof Row,
        className: "px-6 py-4 text-center text-sm text-on-surface",
        render: (_value: Row[keyof Row], row: Row) => {
          const status = row.question?.status ?? "draft";
          return (
            <Badge variant={STATUS_BADGE[status] ?? "neutral"}>
              {STATUS_LABEL[status] ?? status}
            </Badge>
          );
        },
      },
      {
        header: "Bobot",
        accessor: "points" as keyof Row,
        className: "px-6 py-4 text-center text-sm text-on-surface",
        render: (_value: Row[keyof Row], row: Row) => <span>{row.points}</span>,
      },
      {
        header: "Aksi",
        accessor: "id" as keyof Row,
        className: "px-6 py-4 text-center text-sm text-on-surface",
        render: (_value: Row[keyof Row], row: Row) => {
          if (!mutable) {
            return <span className="text-xs text-outline">Terkunci</span>;
          }
          const index = orderIds.indexOf(row.id);
          return (
            <div className="flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index <= 0}
                className="rounded-lg p-1.5 text-outline transition-colors hover:bg-surface-container-low hover:text-primary-container disabled:opacity-30"
                aria-label={`Naikkan soal ${row.position}`}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index < 0 || index >= orderIds.length - 1}
                className="rounded-lg p-1.5 text-outline transition-colors hover:bg-surface-container-low hover:text-primary-container disabled:opacity-30"
                aria-label={`Turunkan soal ${row.position}`}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => openEditPoints(row)}
                className="rounded-lg p-1.5 text-outline transition-colors hover:bg-surface-container-low hover:text-primary-container"
                aria-label={`Ubah bobot soal ${row.position}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setRemoveTarget(row)}
                className="rounded-lg p-1.5 text-outline transition-colors hover:bg-error-container hover:text-error"
                aria-label={`Hapus soal ${row.position} dari ujian`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        },
      },
    ];
  }, [mutable, orderIds, move]);

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-on-surface">Soal Ujian</h3>
          <p className="text-sm text-on-surface-variant">{ordered.length} soal terkomposisi</p>
        </div>
        {mutable && (
          <div className="flex items-center gap-2">
            {orderIds.length >= 2 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleReorder}
                loading={savingOrder}
                disabled={savingOrder}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Simpan Urutan
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={openAdd}
              disabled={adding}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Tambah Soal
            </Button>
          </div>
        )}
      </div>

      {!mutable && (
        <p className="mb-4 rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
          Komposisi soal terkunci untuk status ini. Perubahan hanya dapat dilakukan saat
          ujian berstatus draft.
        </p>
      )}

      {error ? (
        <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-xl py-8">
          <p className="text-sm text-error">{error.message}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchComposition();
            }}
          >
            Muat Ulang
          </Button>
        </div>
      ) : (
        <>
          {/* Kartu untuk mobile */}
          <div className="space-y-3 sm:hidden">
            {loading ? (
              <div className="py-8 text-center text-sm text-outline">Memuat data...</div>
            ) : ordered.length === 0 ? (
              <div className="py-8 text-center text-sm text-outline">
                Belum ada soal dalam ujian ini.
              </div>
            ) : (
              ordered.map((row, index) => (
                <div
                  key={row.id}
                  className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-on-surface">
                        {index + 1}. {row.question?.question_text ?? `#${row.question_id}`}
                      </p>
                      <p className="mt-0.5 text-xs text-on-surface-variant">
                        Bobot: {row.points}
                      </p>
                    </div>
                    <Badge
                      variant={
                        STATUS_BADGE[row.question?.status ?? "draft"] ?? "neutral"
                      }
                      className="shrink-0 px-2.5 py-1 text-xs leading-4"
                    >
                      {STATUS_LABEL[row.question?.status ?? "draft"] ??
                        row.question?.status ??
                        "-"}
                    </Badge>
                  </div>
                  {mutable && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-outline-variant pt-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => move(index, 1)}
                        disabled={index === ordered.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => openEditPoints(row)}>
                        <Pencil className="h-4 w-4" /> Bobot
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setRemoveTarget(row)}
                      >
                        <Trash2 className="h-4 w-4" /> Hapus
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="hidden sm:block">
            <DataTable
              columns={columns}
              data={ordered}
              loading={loading}
              emptyMessage="Belum ada soal dalam ujian ini."
            />
          </div>
        </>
      )}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Tambah Soal ke Ujian"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)} disabled={adding}>
              Batal
            </Button>
            <Button onClick={handleAdd} loading={adding}>
              Tambah
            </Button>
          </>
        }
      >
        {bankQuestions.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            Tidak ada soal yang tersedia. Pastikan ada soal berstatus "Disetujui" yang
            sesuai mata pelajaran ujian dan belum masuk komposisi.
          </p>
        ) : (
          <FormField label="Pilih Soal" required>
            <AppSelect
              value={selectedQuestionId}
              onChange={(v) => setSelectedQuestionId(v ?? "")}
              options={questionOptions}
              placeholder="Pilih soal"
              isDisabled={adding}
            />
          </FormField>
        )}
      </Modal>

      <Modal
        open={pointsTarget !== null}
        onClose={() => setPointsTarget(null)}
        title="Ubah Bobot Soal"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setPointsTarget(null)}
              disabled={savingPoints}
            >
              Batal
            </Button>
            <Button onClick={handleSavePoints} loading={savingPoints}>
              Simpan
            </Button>
          </>
        }
      >
        <FormField label="Bobot (skor maksimal)" required>
          <Input
            type="number"
            min={1}
            max={1000}
            value={pointsInput}
            onChange={(e) => setPointsInput(e.target.value)}
            disabled={savingPoints}
          />
        </FormField>
      </Modal>

      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
        title="Hapus Soal dari Ujian"
        description={`Apakah Anda yakin ingin menghapus soal "${truncate(
          removeTarget?.question?.question_text ?? "",
          80,
        )}" dari ujian ini? Soal di bank soal tidak akan dihapus.`}
        confirmText="Hapus"
        cancelText="Batal"
        destructive
        onConfirm={handleRemove}
      />
    </Card>
  );
}