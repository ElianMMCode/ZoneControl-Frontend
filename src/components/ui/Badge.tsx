import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "active" | "inactive" | "warning" | "error" | "info";

const toneClass: Record<BadgeTone, string> = {
  active: "badge-active",
  inactive: "badge-inactive",
  warning: "badge-warning",
  error: "badge-error",
  info: "badge-info",
};

export function Badge({
  tone = "info",
  icon,
  children,
  className,
}: {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn(toneClass[tone], className)}>
      {icon}
      {children}
    </span>
  );
}
