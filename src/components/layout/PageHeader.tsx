import type { ReactNode } from "react";
import Breadcrumb from "./Breadcrumb";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <Breadcrumb />
      <div className="mt-4 flex flex-col gap-4 rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">{title}</h1>
          {description && <p className="mt-1 text-sm text-on-surface-variant">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
