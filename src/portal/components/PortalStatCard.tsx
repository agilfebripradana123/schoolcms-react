import type { ReactNode } from "react";
import Card, { CardBody } from "@/components/ui/Card";

interface PortalStatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  valueClassName?: string;
  loading?: boolean;
}

export default function PortalStatCard({
  icon,
  label,
  value,
  valueClassName = "text-slate-900",
  loading = false,
}: PortalStatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="mt-2 h-8 w-24 animate-pulse rounded bg-slate-200" />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-5 [&>svg]:w-5">
            {icon}
          </span>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
        <p className={`mt-2 text-2xl font-bold ${valueClassName}`}>{value}</p>
      </CardBody>
    </Card>
  );
}
