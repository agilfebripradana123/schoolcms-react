import type { ReactNode } from "react";
import Card, { CardBody } from "@/components/ui/Card";

interface PortalEmptyStateProps {
  icon: ReactNode;
  title?: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export default function PortalEmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: PortalEmptyStateProps) {
  return (
    <Card className={className}>
      <CardBody className="p-12 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center text-slate-300 [&>svg]:h-10 [&>svg]:w-10">
          {icon}
        </span>
        {title && <p className="mt-3 font-semibold text-slate-700">{title}</p>}
        <p className="mt-1 text-sm text-slate-400">{description}</p>
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </CardBody>
    </Card>
  );
}
