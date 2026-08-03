import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  delta,
  icon,
  tone = "primary",
  progress,
  className,
}: {
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  icon?: string;
  tone?: "primary" | "secondary" | "error";
  progress?: { percent: number; tone?: "primary" | "secondary" | "error" };
  className?: string;
}) {
  const toneClass =
    tone === "secondary" ? "text-secondary" :
    tone === "error" ? "text-error" :
    "text-primary";
  const progressTone = progress?.tone ?? "primary";
  const progressColor =
    progressTone === "secondary" ? "bg-secondary" :
    progressTone === "error" ? "bg-error" :
    "bg-primary";
  return (
    <article className={cn("card flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <span className="label-caps">{label}</span>
        {icon ? <span className={cn("rounded-md bg-surface-container p-1.5", toneClass)}><Icon name={icon} size="sm" /></span> : null}
      </div>
      <span className="text-heading-lg text-on-surface">{value}</span>
      {delta ? <span className="text-body-sm text-on-surface-variant">{delta}</span> : null}
      {progress ? (
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-surface-container" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
          <div className={cn("h-full rounded-full", progressColor)} style={{ width: `${Math.min(100, Math.max(0, progress.percent))}%` }} />
        </div>
      ) : null}
    </article>
  );
}
