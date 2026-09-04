import { useMemo } from "react";
import Select from "react-select";
import type { GroupBase } from "react-select";

export interface SelectOption<T = string | number> {
  value: T;
  label: string;
}

interface AppSelectProps<T = string | number> {
  options: SelectOption<T>[];
  value: T | null | undefined;
  onChange: (value: T | null) => void;
  placeholder?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  noOptionsMessage?: string;
  error?: boolean;
  id?: string;
  className?: string;
  size?: "default" | "sm";
}

const primary = "#7c3aed";
const primarySoft = "rgba(124, 58, 237, 0.08)";
const primarySofter = "rgba(124, 58, 237, 0.15)";
const borderDefault = "#e2e8f0";
const borderHover = "#cbd5e1";
const onSurface = "#191c1e";
const outline = "#7b7487";
const error = "#ba1a1a";

function buildStyles(errorFlag?: boolean, size: "default" | "sm" = "default") {
  const compact = size === "sm";
  const fontSize = compact ? "0.75rem" : "0.875rem";
  return {
    control: (base: object, state: { isFocused: boolean }) => ({
      ...base,
      minHeight: compact ? 32 : 46,
      borderRadius: compact ? "0.5rem" : "1rem",
      borderColor: errorFlag
        ? error
        : state.isFocused
          ? primary
          : borderDefault,
      boxShadow: state.isFocused ? "0 0 0 2px rgba(124, 58, 237, 0.3)" : "0 0 0 0",
      "&:hover": {
        borderColor: state.isFocused ? primary : borderHover,
      },
      backgroundColor: "#ffffff",
      padding: compact ? "0 2px" : "2px 4px",
      cursor: "pointer",
    }),
    valueContainer: (base: object) => ({
      ...base,
      padding: compact ? "0 4px" : "0 8px",
    }),
    placeholder: (base: object) => ({
      ...base,
      color: outline,
      fontSize,
    }),
    singleValue: (base: object) => ({
      ...base,
      color: onSurface,
      fontSize,
    }),
    input: (base: object) => ({
      ...base,
      fontSize,
      color: onSurface,
    }),
    menu: (base: object) => ({
      ...base,
      borderRadius: compact ? "0.5rem" : "1rem",
      border: `1px solid ${borderDefault}`,
      boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
      overflow: "hidden",
      zIndex: 60,
    }),
    menuList: (base: object) => ({
      ...base,
      maxHeight: 240,
    }),
    menuPortal: (base: object) => ({
      ...base,
      zIndex: 60,
    }),
    option: (base: object, state: { isFocused: boolean; isSelected: boolean }) => ({
      ...base,
      backgroundColor: state.isSelected
        ? primary
        : state.isFocused
          ? primarySoft
          : "transparent",
      color: state.isSelected ? "#ffffff" : onSurface,
      fontSize,
      padding: compact ? "4px 8px" : undefined,
      cursor: "pointer",
      "&:active": {
        backgroundColor: state.isSelected ? primary : primarySofter,
      },
    }),
  };
}

export default function AppSelect<T = string | number>({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  isSearchable = true,
  isClearable = false,
  isDisabled = false,
  isLoading = false,
  noOptionsMessage = "Tidak ditemukan.",
  error = false,
  id,
  className = "",
  size = "default",
}: AppSelectProps<T>) {
  const styles = useMemo(() => buildStyles(error, size), [error, size]);

  const selectedOption = useMemo(
    () => options.find((o) => String(o.value) === String(value)) ?? null,
    [options, value],
  );

  return (
    <Select<SelectOption<T>, false, GroupBase<SelectOption<T>>>
      id={id}
      inputId={id}
      options={options}
      value={selectedOption}
      onChange={(opt) => {
        onChange(opt == null ? null : (opt.value as T));
      }}
      placeholder={placeholder}
      isSearchable={isSearchable}
      isClearable={isClearable}
      isDisabled={isDisabled}
      isLoading={isLoading}
      noOptionsMessage={() => noOptionsMessage}
      loadingMessage={() => "Memuat data..."}
      styles={styles}
      menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
      menuPosition="fixed"
      className={`w-full text-sm ${className}`}
    />
  );
}
