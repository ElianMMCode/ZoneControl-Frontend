import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

type Tone = "error" | "success" | "warning" | "info";

const toneClass: Record<Tone, string> = {
  error: "border-error/30 bg-error-container text-error",
  success: "border-secondary/30 bg-secondary-container/30 text-secondary",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-primary/30 bg-primary-container/10 text-primary",
};

const iconByTone: Record<Tone, string> = {
  error: "error",
  success: "check_circle",
  warning: "warning",
  info: "info",
};

export function Alert({ tone = "info", children, title, className }: { tone?: Tone; title?: string; children: ReactNode; className?: string }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex gap-3 rounded-md border p-3", toneClass[tone], className)}>
      <Icon name={iconByTone[tone]} className="mt-0.5 shrink-0" />
      <div className="text-sm">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={cn(title && "mt-0.5")}>{children}</div>
      </div>
    </div>
  );
}
