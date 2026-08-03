import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ invalid, className, ...rest }: Props) {
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn("input", invalid && "input-error", className)}
    />
  );
}

export function FormField({
  id,
  label,
  error,
  help,
  children,
  required,
}: {
  id: string;
  label: string;
  error?: string;
  help?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required ? <span className="ml-0.5 text-error">*</span> : null}
      </label>
      <div className="mt-1">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      ) : help ? (
        <p id={`${id}-help`} className="field-help">
          {help}
        </p>
      ) : null}
    </div>
  );
}
