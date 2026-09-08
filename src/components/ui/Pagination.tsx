import Button from "./Button";

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  loading?: boolean;
  error?: unknown;
  className?: string;
}

export default function Pagination({ meta, onPageChange, loading, error, className = "" }: PaginationProps) {
  if (error || loading || meta.total === 0) return null;

  const isFirstPage = meta.current_page <= 1;
  const isLastPage = meta.current_page >= meta.last_page;
  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  return (
    <div className={`mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row ${className}`}>
      <p className="text-sm text-on-surface-variant">
        Menampilkan {from}-{to} dari {meta.total} data
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={isFirstPage}
          onClick={() => onPageChange(meta.current_page - 1)}
        >
          Sebelumnya
        </Button>
        <span className="text-sm text-on-surface-variant">
          Halaman {meta.current_page} dari {meta.last_page}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={isLastPage}
          onClick={() => onPageChange(meta.current_page + 1)}
        >
          Berikutnya
        </Button>
      </div>
    </div>
  );
}

export type { PaginationMeta, PaginationProps };
