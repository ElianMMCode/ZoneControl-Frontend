import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  label?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = "Buscar...", ariaLabel = "Buscar", label, className, ...rest }: Props) {
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={rest.id} className="field-label">
          {label}
        </label>
      ) : null}
      <div className={cn("relative", label && "mt-1")}>
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant">
          <Icon name="search" size="sm" />
        </span>
        <input
          {...rest}
          type="search"
          aria-label={ariaLabel}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input h-10 w-full rounded-full pl-9 pr-9"
        />
        {value ? (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => onChange("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-variant hover:text-on-surface"
          >
            <Icon name="close" size="sm" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
