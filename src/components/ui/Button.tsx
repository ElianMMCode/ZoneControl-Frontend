import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leadingIcon,
  trailingIcon,
  disabled,
  className,
  children,
  ...rest
}: Props) {
  const variantClass =
    variant === "primary" ? "btn-primary" :
    variant === "secondary" ? "btn-secondary" :
    variant === "danger" ? "btn-danger" :
    "btn-ghost";
  const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";
  return (
    <button
      type={rest.type ?? "button"}
      {...rest}
      disabled={disabled || loading}
      className={cn(variantClass, sizeClass, className)}
    >
      {loading ? <Spinner className="h-4 w-4" /> : leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={cn("inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent", className)}
    />
  );
}
