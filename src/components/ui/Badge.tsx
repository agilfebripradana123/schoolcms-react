import type { ReactNode } from "react";

type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "danger" | "neutral";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-primary-container/15 text-primary-container",
  secondary: "border border-outline-variant bg-surface-container-lowest text-on-surface-variant",
  success: "bg-tertiary-container/30 text-tertiary",
  warning: "bg-warning-container/30 text-warning",
  danger: "bg-error-container text-error",
  neutral: "bg-surface-container-high text-on-surface-variant",
};

export default function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold leading-none ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
