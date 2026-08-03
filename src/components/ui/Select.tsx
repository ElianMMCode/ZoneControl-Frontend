import type { SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ invalid, className, children, ...rest }: Props) {
  return (
    <select
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn("input appearance-none pr-9", invalid && "input-error", className)}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={cn("input min-h-24 py-2", className)} />;
}

export function Option({ children, ...rest }: React.OptionHTMLAttributes<HTMLOptionElement>) {
  return <option {...rest}>{children}</option>;
}

export function SelectField({
  id,
  label,
  error,
  required,
  children,
  help,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  help?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required ? <span className="ml-0.5 text-error">*</span> : null}
      </label>
      <div className="mt-1">{children}</div>
      {error ? <p className="field-error" role="alert">{error}</p> : help ? <p className="field-help">{help}</p> : null}
    </div>
  );
}
