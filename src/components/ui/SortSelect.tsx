import { ArrowUpDown } from "lucide-react";

interface SortSelectProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  className?: string;
}

export default function SortSelect({
  value,
  options,
  onChange,
  className = "",
}: SortSelectProps) {
  return (
    <div className={`relative ${className}`}>
      <ArrowUpDown
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
        aria-hidden="true"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Urutkan data"
        className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm text-on-surface transition-colors focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/30"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}