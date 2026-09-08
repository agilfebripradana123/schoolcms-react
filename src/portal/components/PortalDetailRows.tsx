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
          <dt className="text-slate-500">{row.label}</dt>
          <dd className="text-right font-medium text-slate-700">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
