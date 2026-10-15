import type { InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextField({
  label,
  error,
  id,
  name,
  className = "",
  ...props
}: TextFieldProps) {
  const fieldId = id ?? name;

  return (
    <div className="grid gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`h-11 rounded-lg border bg-panel px-3 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15 ${error ? "border-danger" : "border-line"} ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
