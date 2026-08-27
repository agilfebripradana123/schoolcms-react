import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from "react";

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

export function FormField({ label, error, hint, required, children, className = "" }: FormFieldProps) {
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
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = "", ...props }, ref) => (
    <textarea
      ref={ref}
      className={`${baseInput} min-h-[100px] resize-y ${className}`}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

/* ── Select ── */
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", options, placeholder, ...props }, ref) => (
    <select
      ref={ref}
      className={`${baseInput} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%237b7487%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10 ${className}`}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
);
Select.displayName = "Select";
