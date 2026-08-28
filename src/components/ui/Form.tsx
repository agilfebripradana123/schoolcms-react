import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from "react";
import ReactSelect from "react-select";
import type { CSSObjectWithLabel, GroupBase, OptionProps as RSOptionProps } from "react-select";

export type SelectOption = { value: string; label: string };

// ponytail: komponen form minimal — tambah date picker / file upload saat modul butuh

const baseInput =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-on-surface placeholder-outline transition-colors focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/30 disabled:cursor-not-allowed disabled:opacity-50";

/* ── FormField wrapper ── */
interface FormFieldProps {
  label?: string; 
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-semibold text-on-surface">
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-outline">{hint}</p>}
    </div>
  );
}

/* ── Input ── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", icon, ...props }, ref) => (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        className={`${baseInput} ${icon ? "pl-10" : ""} ${className}`}
        {...props}
      />
    </div>
  ),
);
Input.displayName = "Input";

/* ── Textarea ── */
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...props }, ref) => (
  <textarea
    ref={ref}
    className={`${baseInput} min-h-[100px] resize-y ${className}`}
    {...props}
  />
));
Textarea.displayName = "Textarea";

/* ── Select (react-select, drop-in API) ── */
interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange?: (event: { target: { value: string } }) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  isSearchable?: boolean;
}

// Gaya react-select agar selaras dengan Input (rounded-2xl, border slate, focus ring primary)
const rsSelect = {
  control: (provided: CSSObjectWithLabel, state: { isFocused: boolean }) => ({
    ...provided,
    minHeight: "46px",
    borderRadius: "1rem",
    borderColor: state.isFocused ? "rgb(97 77 168)" : "rgb(226 232 240)",
    boxShadow: state.isFocused ? "0 0 0 3px rgb(97 77 168 / 0.3)" : provided.boxShadow,
    backgroundColor: "#ffffff",
    cursor: "pointer",
    "&:hover": { borderColor: "rgb(97 77 168)" },
  }),
  menu: (provided: CSSObjectWithLabel) => ({
    ...provided,
    borderRadius: "1rem",
    overflow: "hidden",
    zIndex: 50,
  }),
  option: (
    provided: CSSObjectWithLabel,
    state: RSOptionProps<SelectOption, false, GroupBase<SelectOption>>,
  ) => ({
    ...provided,
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "rgb(97 77 168)"
      : state.isFocused
        ? "rgba(97 77 168, 0.08)"
        : "#fff",
    color: state.isSelected ? "#fff" : "rgb(15 23 42)",
    "&:active": {
      backgroundColor: state.isSelected ? "rgb(97 77 168)" : "rgba(97 77 168, 0.15)",
    },
  }),
  placeholder: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: "rgb(148 163 184)",
  }),
  singleValue: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: "rgb(15 23 42)",
  }),
  indicatorSeparator: () => ({ display: "none" }),
};

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      className = "",
      options,
      value,
      onChange,
      placeholder,
      disabled,
      id,
      name,
      isSearchable,
    },
    ref,
  ) => {
    const strValue = value === undefined || value === null ? "" : String(value);
    const selected = options.find((o) => o.value === strValue) ?? null;
    return (
      <div ref={ref} className={className}>
        <ReactSelect
          inputId={id ? `${id}-input` : undefined}
          name={name}
          options={options}
          value={selected}
          placeholder={placeholder}
          isDisabled={disabled}
          isSearchable={isSearchable ?? options.length > 8}
          classNamePrefix="rs"
          styles={rsSelect}
          menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
          onChange={(option) => {
            onChange?.({ target: { value: option?.value ?? "" } });
          }}
        />
      </div>
    );
  },
);
Select.displayName = "Select";
