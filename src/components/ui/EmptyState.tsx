import type { ReactNode } from "react";
import { Icon } from "./Icon";

export function EmptyState({
  title,
  description,
  action,
  icon = "inbox",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <span className="rounded-full bg-surface-container p-4 text-on-surface-variant">
        <Icon name={icon} size="lg" />
      </span>
      <h3 className="text-heading-md text-on-surface">{title}</h3>
      {description ? <p className="max-w-sm text-body-sm text-on-surface-variant">{description}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center" role="alert">
      <span className="rounded-full bg-error-container p-4 text-error">
        <Icon name="error" size="lg" />
      </span>
      <h3 className="text-heading-md text-on-surface">No se pudo cargar la información</h3>
      <p className="max-w-sm text-body-sm text-on-surface-variant">{message}</p>
      {onRetry ? (
        <button type="button" className="btn btn-md btn-secondary" onClick={onRetry}>
          <Icon name="refresh" /> Reintentar
        </button>
      ) : null}
    </div>
  );
}
