import { useState, useCallback, useRef, useEffect } from "react";
import { Search as SearchIcon, X } from "lucide-react";

// ponytail: search lokal saja — tambah debounced API search saat data besar

interface SearchProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export default function Search({
  value: controlledValue,
  onChange,
  placeholder = "Cari...",
  className = "",
  autoFocus = false,
}: SearchProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  const currentValue = controlledValue ?? internalValue;

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setInternalValue(v);
      onChange(v);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    setInternalValue("");
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  return (
    <div className={`relative ${className}`}>
      <SearchIcon
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="text"
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm text-on-surface placeholder-outline transition-colors focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/30"
      />
      {currentValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-outline hover:text-on-surface"
          aria-label="Hapus pencarian"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
