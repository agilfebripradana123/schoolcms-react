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

function buildStyles(errorFlag?: boolean) {
  const primary = "var(--primary)";
  const primaryContainer = "var(--primary-container)";
  const primarySoft =
    "color-mix(in srgb, var(--primary) 8%, transparent)";
  const primarySofter =
    "color-mix(in srgb, var(--primary) 15%, transparent)";

  const surface = "var(--surface-container-lowest)";
  const surfaceContainer = "var(--surface-container)";
  const surfaceHigh = "var(--surface-container-high)";
  const onSurface = "var(--on-surface)";
  const onSurfaceVariant = "var(--on-surface-variant)";
  const outline = "var(--outline)";
  const outlineVariant = "var(--outline-variant)";
  const error = "var(--error)";
  const onPrimary = "var(--on-primary)";

  return {
    control: (
      base: object,
      state: { isFocused: boolean; isDisabled: boolean },
    ) => ({
      ...base,

      minHeight: 46,
      borderRadius: "1rem",

      borderColor: errorFlag
        ? error
        : state.isFocused
          ? primary
          : outlineVariant,

      boxShadow: state.isFocused
        ? `0 0 0 2px color-mix(in srgb, ${primary} 30%, transparent)`
        : "0 0 0 0",

      "&:hover": {
        borderColor: errorFlag
          ? error
          : state.isFocused
            ? primary
            : outline,
      },

      backgroundColor: state.isDisabled
        ? surfaceContainer
        : surface,

      padding: "2px 4px",
      cursor: state.isDisabled ? "not-allowed" : "pointer",
      opacity: state.isDisabled ? 0.6 : 1,
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
      marginTop: 6,
      borderRadius: "1rem",
      border: `1px solid ${outlineVariant}`,
      backgroundColor: surface,
      boxShadow:
        "0 12px 32px rgba(0, 0, 0, 0.20)",
      overflow: "hidden",
      zIndex: 60,
    }),

    menuList: (base: object) => ({
      ...base,
      maxHeight: 240,
      padding: "6px",
      backgroundColor: surface,
    }),

    menuPortal: (base: object) => ({
      ...base,
      zIndex: 60,
    }),

    option: (
      base: object,
      state: {
        isFocused: boolean;
        isSelected: boolean;
        isDisabled: boolean;
      },
    ) => ({
      ...base,

      borderRadius: "0.75rem",
      backgroundColor: state.isSelected
        ? primaryContainer
        : state.isFocused
          ? primarySoft
          : "transparent",

      color: state.isSelected
        ? onPrimary
        : state.isDisabled
          ? outline
          : onSurface,

      fontSize: "0.875rem",
      cursor: state.isDisabled ? "not-allowed" : "pointer",

      "&:active": {
        backgroundColor: state.isSelected
          ? primary
          : primarySofter,
      },
    }),

    indicatorSeparator: (base: object) => ({
      ...base,
      backgroundColor: outlineVariant,
    }),

    dropdownIndicator: (
      base: object,
      state: { isFocused: boolean },
    ) => ({
      ...base,
      color: state.isFocused ? primary : outline,

      "&:hover": {
        color: primary,
      },
    }),

    clearIndicator: (base: object) => ({
      ...base,
      color: outline,

      "&:hover": {
        color: error,
      },
    }),

    loadingIndicator: (base: object) => ({
      ...base,
      color: primary,
    }),

    noOptionsMessage: (base: object) => ({
      ...base,
      color: onSurfaceVariant,
      fontSize: "0.875rem",
    }),

    loadingMessage: (base: object) => ({
      ...base,
      color: onSurfaceVariant,
      fontSize: "0.875rem",
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
  const styles = useMemo(
    () => buildStyles(error),
    [error],
  );

  const selectedOption = useMemo(
    () =>
      options.find(
        (o) => String(o.value) === String(value),
      ) ?? null,
    [options, value],
  );

  return (
    <Select<
      SelectOption<T>,
      false,
      GroupBase<SelectOption<T>>
    >
      id={id}
      inputId={id}
      options={options}
      value={selectedOption}
      onChange={(opt) => {
        onChange(
          opt == null
            ? null
            : (opt.value as T),
        );
      }}
      placeholder={placeholder}
      isSearchable={isSearchable}
      isClearable={isClearable}
      isDisabled={isDisabled}
      isLoading={isLoading}
      noOptionsMessage={() => noOptionsMessage}
      loadingMessage={() => "Memuat data..."}
      styles={styles}
      menuPortalTarget={
        typeof document !== "undefined"
          ? document.body
          : undefined
      }
      menuPosition="fixed"
      className={`w-full text-sm ${className}`}
    />
  );
}