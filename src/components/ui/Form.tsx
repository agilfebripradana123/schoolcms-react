import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from "react";
import AppSelect from "./Select";

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
        <label className="mb-1.5 block text-sm text-on-surface">
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

/* ── Select (react-select via AppSelect, drop-in API) ── */
interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange?: (event: { target: { value: string } }) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ className = "", options, value, onChange, placeholder, disabled, id }, ref) => {
    const strValue = value === undefined || value === null ? "" : String(value);
    return (
      <div ref={ref} className={className}>
        <AppSelect
          id={id}
          options={options}
          value={strValue}
          onChange={(v) => onChange?.({ target: { value: String(v ?? "") } })}
          placeholder={placeholder}
          isDisabled={disabled}
          isSearchable={options.length > 8}
        />
      </div>
    );
  },
);
Select.displayName = "Select";
