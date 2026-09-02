import { ShieldAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import type { ApiError } from "@/types";

interface ErrorStateProps {
  error: ApiError;
  onRetry?: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const isForbidden = error.status === 403;

  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl py-10 text-center">
      <ShieldAlert className="h-10 w-10 text-error" strokeWidth={1.5} />
      <p className="text-sm font-medium text-error">
        {isForbidden
          ? "Anda tidak memiliki akses untuk melihat halaman ini."
          : error.message}
      </p>
      {isForbidden && (
        <p className="text-xs text-on-surface-variant">
          Halaman ini hanya dapat diakses oleh Admin atau Administrator.
        </p>
      )}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Muat Ulang
        </Button>
      )}
    </div>
  );
}
