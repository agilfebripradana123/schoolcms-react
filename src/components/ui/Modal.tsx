import {
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
} as const;

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const overlayRef =
    useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50
        p-4
        backdrop-blur-sm
      "
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`
          ${sizeMap[size]}
          w-full
          overflow-hidden
          rounded-3xl
          border border-outline-variant
          bg-surface-container-lowest
          text-on-surface
          shadow-2xl
        `}
      >
        {/* Header */}
        <div
          className="
            flex items-center justify-between
            border-b border-outline-variant
            px-6 py-4
          "
        >
          <h2
            className="
              font-display
              text-lg
              font-semibold
              text-on-surface
            "
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-xl
              p-1.5
              text-outline
              transition-colors
              hover:bg-surface-container-high
              hover:text-on-surface
              focus:outline-none
              focus:ring-2
              focus:ring-primary-container
            "
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div
          className="
            max-h-[70vh]
            overflow-y-auto
            px-6 py-4
          "
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="
              flex items-center justify-end gap-3
              border-t border-outline-variant
              bg-surface-container-low
              px-6 py-4
            "
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}