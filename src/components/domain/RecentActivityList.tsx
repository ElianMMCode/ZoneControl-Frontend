import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { formatDateTime, timeAgo } from "@/lib/format";
import { fullName } from "@/lib/format";
import { StatusPill } from "@/components/common/StatusPill";
import type { AccessHistoryResponse } from "@/types";

export function RecentActivityList({
  events,
  loading,
  error,
  onRefresh,
}: {
  events: AccessHistoryResponse[];
  loading: boolean;
  error: { message: string } | null;
  onRefresh: () => void;
}) {
  if (loading) {
    return (
      <section className="card">
        <header className="card-header">
          <h2 className="text-heading-md">Actividad reciente</h2>
          <span className="label-caps">Hoy</span>
        </header>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card">
        <header className="card-header">
          <h2 className="text-heading-md">Actividad reciente</h2>
          <span className="label-caps">Hoy</span>
        </header>
        <ErrorState message={error.message} onRetry={onRefresh} />
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="card">
        <header className="card-header">
          <h2 className="text-heading-md">Actividad reciente</h2>
          <span className="label-caps">Hoy</span>
        </header>
        <EmptyState
          title="Sin actividad hoy"
          description="No se han registrado intentos de acceso en el día de hoy."
          icon="event_busy"
        />
      </section>
    );
  }

  return (
    <section className="card">
      <header className="card-header">
        <h2 className="text-heading-md">Actividad reciente</h2>
        <Link to="/supervisor" className="label-caps text-primary hover:underline">Ver historial completo</Link>
      </header>
      <ul className="divide-y divide-outline-variant">
        {events.map((h) => (
          <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm font-semibold text-on-surface" title={fullName(h.employeeName, h.employeeName)}>
                {h.employeeName ?? h.employeeCode ?? "—"}
              </p>
              <p className="text-body-sm text-on-surface-variant">
                {h.department} · {h.productionAreaName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill status={h.result} />
              <span className="text-body-sm text-on-surface-variant" title={formatDateTime(h.timestamp)}>
                {timeAgo(h.timestamp)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
