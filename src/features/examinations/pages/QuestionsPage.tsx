import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Search from "@/components/ui/Search";
import AppSelect from "@/components/ui/Select";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { questionBankService } from "../api/question.service";
import { subjectService } from "@/features/academic/api/subject.service";
import type { Subject } from "@/features/academic/api/types";
import type {
  QuestionBank,
  QuestionDifficulty,
  QuestionType,
} from "../api/types";
import QuestionForm from "../components/question/QuestionForm";
import QuestionDeleteDialog from "../components/question/QuestionDeleteDialog";
import Pagination from "../../../components/ui/Pagination";

const PER_PAGE = 10;

const TYPE_LABEL: Record<QuestionType, string> = {
  multiple_choice: "Pilihan Ganda",
  true_false: "Benar/Salah",
  essay: "Esai",
};

const TYPE_BADGE: Record<QuestionType, string> = {
  multiple_choice: "primary",
  true_false: "secondary",
  essay: "neutral",
};

const DIFFICULTY_LABEL: Record<QuestionDifficulty, string> = {
  easy: "Mudah",
  medium: "Sedang",
  hard: "Sulit",
};

const DIFFICULTY_BADGE: Record<QuestionDifficulty, string> = {
  easy: "success",
  medium: "warning",
  hard: "danger",
};

const TYPE_FILTER_OPTIONS = [
  { value: "all", label: "Semua Tipe" },
  { value: "multiple_choice", label: "Pilihan Ganda" },
  { value: "true_false", label: "Benar/Salah" },
  { value: "essay", label: "Esai" },
];

const DIFFICULTY_FILTER_OPTIONS = [
  { value: "all", label: "Semua Kesulitan" },
  { value: "easy", label: "Mudah" },
  { value: "medium", label: "Sedang" },
  { value: "hard", label: "Sulit" },
];

interface QueryState {
  search: string;
  subject_id: number | undefined;
  type: QuestionType | undefined;
  difficulty: QuestionDifficulty | undefined;
  page: number;
}

function truncate(text: string, max = 120): string {
  if (!text) return "-";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export default function QuestionsPage() {
  const [data, setData] = useState<QuestionBank[]>([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: PER_PAGE,
    total: 0,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const [query, setQuery] = useState<QueryState>({
    search: "",
    subject_id: undefined,
    type: undefined,
    difficulty: undefined,
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<QuestionBank | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<QuestionBank | null>(null);

  const searchTimeout = useRef<number | null>(null);

  useEffect(() => {
    subjectService
      .list()
      .then((res) => setSubjects(res.data))
      .catch(() => {
        toast.error("Gagal memuat data mata pelajaran");
      });
  }, []);

  useEffect(() => {
    let active = true;

    questionBankService
      .list({
        search: query.search || undefined,
        subject_id: query.subject_id,
        type: query.type,
        difficulty: query.difficulty,
        page: query.page,
        per_page: PER_PAGE,
      })
      .then((res) => {
        if (!active) return;
        setData(res.data);
        setMeta(res.meta);
      })
      .catch((err) => {
        if (!active) return;
        setError(toApiError(err));
        setData([]);
        toast.error("Gagal memuat data soal", {
          description: toApiError(err).message,
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    searchTimeout.current = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      setQuery((prev) => ({ ...prev, search: value, page: 1 }));
    }, 400);
  }, []);

  const handleSubjectChange = useCallback((value: string) => {
    setSubjectFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      subject_id: value === "all" ? undefined : Number(value),
      page: 1,
    }));
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setTypeFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      type: value === "all" ? undefined : (value as QuestionType),
      page: 1,
    }));
  }, []);

  const handleDifficultyChange = useCallback((value: string) => {
    setDifficultyFilter(value);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({
      ...prev,
      difficulty: value === "all" ? undefined : (value as QuestionDifficulty),
      page: 1,
    }));
  }, []);

  const goToPage = useCallback((target: number) => {
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const handleSaved = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev }));
  }, []);

  const handleDeleted = useCallback(() => {
    setDeleteOpen(false);
    setToDelete(null);
    setLoading(true);
    setError(null);
    setQuery((prev) => ({ ...prev }));
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: QuestionBank) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: QuestionBank) => {
    setToDelete(row);
    setDeleteOpen(true);
  }, []);

  const subjectMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const s of subjects) map[s.id] = s.name;
    return map;
  }, [subjects]);

  const subjectName = useCallback(
    (row: QuestionBank) =>
      row.subject?.name ??
      (row.subject_id != null ? subjectMap[row.subject_id] ?? `#${row.subject_id}` : "-"),
    [subjectMap],
  );

  const columns = useMemo(() => {
    type Row = QuestionBank;
    return [
      {
        header: "Soal",
        accessor: "question_text" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span
            className="line-clamp-2 max-w-[340px] text-sm font-medium text-on-surface"
            title={row.question_text}
          >
            {truncate(row.question_text)}
          </span>
        ),
      },
      {
        header: "Mata Pelajaran",
        accessor: "subject_id" as keyof Row,
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">{subjectName(row)}</span>
        ),
      },
      {
        header: "Tipe",
        accessor: "type" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <Badge
            variant={TYPE_BADGE[row.type] as "primary" | "secondary" | "neutral"}
            className="px-2.5 py-1 text-xs leading-4"
          >
            {TYPE_LABEL[row.type]}
          </Badge>
        ),
      },
      {
        header: "Kesulitan",
        accessor: "difficulty" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <Badge
            variant={
              DIFFICULTY_BADGE[row.difficulty] as "success" | "warning" | "danger"
            }
            className="px-2.5 py-1 text-xs leading-4"
          >
            {DIFFICULTY_LABEL[row.difficulty]}
          </Badge>
        ),
      },
      {
        header: "Bobot",
        accessor: "points" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">{row.points}</span>
        ),
      },
      {
        header: "Pilihan",
        accessor: "type" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <span className="text-sm text-slate-700">
            {row.type === "essay" ? "-" : `${row.options?.length ?? 0} pilihan`}
          </span>
        ),
      },
      {
        header: "Aksi",
        accessor: "id" as keyof Row,
        headerClassName:
          "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
        className: "px-6 py-4 text-center text-sm text-slate-700",
        render: (_value: Row[keyof Row], row: Row) => (
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-container"
              aria-label={`Edit soal ${row.id}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => openDelete(row)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-error-container hover:text-error"
              aria-label={`Hapus soal ${row.id}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ];
  }, [subjectName, openEdit, openDelete]);


  const subjectFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua Mata Pelajaran" },
      ...subjects.map((s) => ({ value: String(s.id), label: s.name })),
    ],
    [subjects],
  );

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Bank Soal"
        description="Kelola soal ujian dan pilihan jawaban."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah Soal
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end *:md:gap-3">
          <div className="md:min-w-[220px] md:flex-1">
            <Search
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari teks soal..."
            />
          </div>
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:min-w-[160px] md:flex-1">
            <span className="whitespace-nowrap">Mata Pelajaran</span>
            <AppSelect
              options={subjectFilterOptions}
              value={subjectFilter}
              onChange={(v) => handleSubjectChange(v ?? "all")}
              placeholder="Pilih Mata Pelajaran"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:min-w-[150px] md:flex-1">
            <span className="whitespace-nowrap">Tipe</span>
            <AppSelect
              options={TYPE_FILTER_OPTIONS}
              value={typeFilter}
              onChange={(v) => handleTypeChange(v ?? "all")}
              placeholder="Pilih Tipe"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-on-surface md:min-w-[160px] md:flex-1">
            <span className="whitespace-nowrap">Kesulitan</span>
            <AppSelect
              options={DIFFICULTY_FILTER_OPTIONS}
              value={difficultyFilter}
              onChange={(v) => handleDifficultyChange(v ?? "all")}
              placeholder="Pilih Kesulitan"
            />
          </label>
        </div>

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat data soal.</p>
            <Button
              variant="secondary"
              onClick={() => {
                setLoading(true);
                setError(null);
                setQuery((prev) => ({ ...prev }));
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
                <div className="py-10 text-center text-sm text-slate-500">
                  Memuat data...
                </div>
              ) : data.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Belum ada soal.
                </div>
              ) : (
                data.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 font-medium text-on-surface">
                          {row.question_text}
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {subjectName(row)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          TYPE_BADGE[row.type] as "primary" | "secondary" | "neutral"
                        }
                        className="shrink-0 px-2.5 py-1 text-xs leading-4"
                      >
                        {TYPE_LABEL[row.type]}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          DIFFICULTY_BADGE[row.difficulty] as
                            | "success"
                            | "warning"
                            | "danger"
                        }
                        className="px-2.5 py-1 text-xs leading-4"
                      >
                        {DIFFICULTY_LABEL[row.difficulty]}
                      </Badge>
                      <span className="text-xs text-on-surface-variant">
                        Bobot: {row.points}
                      </span>
                      {row.type !== "essay" && (
                        <span className="text-xs text-on-surface-variant">
                          {row.options?.length ?? 0} pilihan
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => openDelete(row)}
                      >
                        <Trash2 className="h-4 w-4" /> Hapus
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="hidden sm:block">
              <DataTable
                columns={columns}
                data={data}
                loading={loading}
                emptyMessage="Belum ada soal."
              />
            </div>
          </>
        )}

        <Pagination meta={meta} onPageChange={goToPage} loading={loading} error={error} />
      </Card>

      <QuestionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <QuestionDeleteDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setToDelete(null);
        }}
        onDeleted={handleDeleted}
        data={toDelete}
      />
    </PageContainer>
  );
}
