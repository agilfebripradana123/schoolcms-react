import AppSelect from "./Select";

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
    <AppSelect
      options={options}
      value={value}
      onChange={(v) => onChange(v ?? value)}
      isSearchable={false}
      isClearable={false}
      placeholder="Urutkan"
      className={className}
    />
  );
}
