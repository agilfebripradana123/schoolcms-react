import type { ReactNode } from "react";

type BadgeVariant = "primary" | "success" | "warning" | "danger" | "neutral";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-primary-container/15 text-primary-container",
  success: "bg-tertiary-container/30 text-tertiary",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-error-container text-error",
  neutral: "bg-surface-container-high text-on-surface-variant",
};

export default function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
