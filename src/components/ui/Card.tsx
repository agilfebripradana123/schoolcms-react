import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-surface-container-lowest p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, actions, className = "" }: CardHeaderProps) {
  return (
    <div className={`mb-4 flex items-start justify-between gap-4 ${className}`}>
      <div>
        <h3 className="font-display text-base font-semibold text-on-surface">{title}</h3>
        {description && <p className="mt-1 text-sm text-on-surface-variant">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface CardSectionProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardSectionProps) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = "" }: CardSectionProps) {
  return <div className={`mt-4 flex items-center justify-end gap-3 ${className}`}>{children}</div>;
}
