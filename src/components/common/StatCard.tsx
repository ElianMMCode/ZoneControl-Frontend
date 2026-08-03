import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  delta,
  icon,
  tone = "primary",
  className,
}: {
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  icon?: string;
  tone?: "primary" | "secondary" | "error";
  className?: string;
}) {
  const toneClass =
    tone === "secondary" ? "text-secondary" :
    tone === "error" ? "text-error" :
    "text-primary";
  return (
    <article className={cn("card flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <span className="label-caps">{label}</span>
        {icon ? <span className={cn("rounded-md bg-surface-container p-1.5", toneClass)}><Icon name={icon} size="sm" /></span> : null}
      </div>
      <span className="text-heading-lg text-on-surface">{value}</span>
      {delta ? <span className="text-body-sm text-on-surface-variant">{delta}</span> : null}
    </article>
  );
}
