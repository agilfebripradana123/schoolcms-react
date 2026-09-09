import type { ReactNode } from "react";

interface PortalDetailRow {
  label: string;
  value: ReactNode;
}

interface PortalDetailRowsProps {
  rows: PortalDetailRow[];
}

export default function PortalDetailRows({ rows }: PortalDetailRowsProps) {
  return (
    <dl className="space-y-3 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between gap-4">
          <dt className="text-secondary">{row.label}</dt>
          <dd className="text-right font-medium text-secondary">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
