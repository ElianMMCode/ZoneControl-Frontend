import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { QuickActions } from "@/components/common/QuickActions";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusPill } from "@/components/common/StatusPill";
import { ErrorState } from "@/components/ui/EmptyState";
import { useResource } from "@/hooks/useResource";
import { formatDateTime, formatNumber } from "@/lib/format";
import type { AccessHistoryResponse, Page, SupervisorStatsResponse } from "@/types";

const today = new Date();
const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
const iso = (d: Date) => d.toISOString().slice(0, 10);

export function SupervisorDashboard() {
  const stats = useResource<SupervisorStatsResponse>("/api/historial/stats");
  const history = useResource<Page<AccessHistoryResponse>>("/api/historial", {
    fechaInicio: iso(thirtyDaysAgo),
    fechaFin: iso(today),
    page: 0,
    size: 10,
  });

  const columns: Column<AccessHistoryResponse>[] = [
    { key: "ts", header: "Fecha", render: (h) => formatDateTime(h.timestamp) },
    { key: "emp", header: "Empleado", render: (h) => h.employeeName ?? h.employeeCode ?? "—" },
    { key: "area", header: "Área", render: (h) => h.productionAreaName },
    { key: "dept", header: "Departamento", render: (h) => h.department },
    { key: "result", header: "Resultado", render: (h) => <StatusPill status={h.result} /> },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Panel de Supervisión" subtitle="Monitoreo de accesos en el laboratorio" />

      {stats.loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : stats.error ? (
        <ErrorState message={stats.error.message} onRetry={stats.refresh} />
      ) : stats.data ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <StatCard label="Accesos hoy" value={formatNumber(stats.data.totalAccesosHoy)} icon="door_front" />
          <StatCard label="Autorizados" value={formatNumber(stats.data.accesosAutorizadosHoy)} icon="check_circle" tone="secondary" />
          <StatCard label="Denegados" value={formatNumber(stats.data.accesosDenegadosHoy)} icon="block" tone="error" />
          <StatCard label="Suspendidos" value={formatNumber(stats.data.accesosSuspendidosHoy)} icon="pause_circle" />
          <StatCard label="Permisos activos" value={formatNumber(stats.data.totalPermisosActivos)} icon="vpn_key" />
        </div>
      ) : null}

      <QuickActions
        actions={[
          { label: "Validar credencial", icon: "verified_user", to: "/supervisor/validar" },
          { label: "Zonas en vivo", icon: "location_on", to: "/supervisor/zones" },
          { label: "Reportes / Historial", icon: "summarize", to: "/supervisor/reportes" },
        ]}
      />

      <section className="card">
        <header className="card-header">
          <h2 className="text-heading-md">Actividad reciente</h2>
          <span className="label-caps">Últimos 30 días</span>
        </header>
        {history.loading ? (
          <div className="overflow-x-auto rounded-lg border border-outline-variant">
            <table className="data-table">
              <thead><tr><th>Fecha</th><th>Empleado</th><th>Área</th><th>Departamento</th><th>Resultado</th></tr></thead>
              <tbody>{Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)}</tbody>
            </table>
          </div>
        ) : history.error ? (
          <ErrorState message={history.error.message} onRetry={history.refresh} />
        ) : history.data && history.data.content.length > 0 ? (
          <DataTable columns={columns} data={history.data.content} rowKey={(h) => h.id} />
        ) : (
          <p className="text-body-sm text-on-surface-variant">Sin actividad registrada en los últimos 30 días.</p>
        )}
      </section>
    </div>
  );
}
