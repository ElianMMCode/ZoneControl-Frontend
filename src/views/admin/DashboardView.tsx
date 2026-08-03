import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatCardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { useResource } from "@/hooks/useResource";
import { apiFetch } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import type { AdminStatsResponse, UserResponse } from "@/types";

export function AdminDashboard() {
  const stats = useResource<AdminStatsResponse>("/api/admin/stats");
  const [pending, setPending] = useState<UserResponse[] | null>(null);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [pendingLoading, setPendingLoading] = useState(true);

  useEffect(() => {
    setPendingLoading(true);
    apiFetch<{ content: UserResponse[] }>("/api/admin/users", { query: { size: 50, role: undefined, status: undefined, search: undefined, page: 0 } })
      .then((res) => setPending(res.content.filter((u) => u.requirePasswordChange)))
      .catch(() => setPendingError("No se pudo cargar la lista de usuarios pendientes."))
      .finally(() => setPendingLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader title="Panel de Administración" subtitle="Resumen general del sistema ZoneControl" />

      {stats.loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : stats.error ? (
        <ErrorState message={stats.error.message} onRetry={stats.refresh} />
      ) : stats.data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Usuarios activos" value={formatNumber(stats.data.usuariosActivos)} delta={`de ${formatNumber(stats.data.totalUsuarios)} totales`} icon="group" />
          <StatCard label="Empleados" value={formatNumber(stats.data.totalEmpleados)} delta={`${formatNumber(stats.data.empleadosActivos)} activos`} icon="badge" tone="secondary" />
          <StatCard label="Permisos activos" value={formatNumber(stats.data.permisosActivos)} delta={`${formatNumber(stats.data.permisosSuspendidos)} suspendidos`} icon="vpn_key" />
          <StatCard
            label="Pendientes de configuración"
            value={formatNumber(stats.data.usuariosSinConfiguracion)}
            delta="Requieren activar su cuenta"
            icon="pending_actions"
            tone={stats.data.usuariosSinConfiguracion > 0 ? "error" : "primary"}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card">
          <header className="card-header">
            <h2 className="text-heading-md">Usuarios sin configuración</h2>
            <Badge tone="warning">{pending?.length ?? "—"} pendientes</Badge>
          </header>
          {pendingLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : pendingError ? (
            <ErrorState message={pendingError} />
          ) : !pending?.length ? (
            <p className="text-body-sm text-on-surface-variant">No hay usuarios pendientes. Todo al día.</p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {pending.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-container font-mono text-body-sm text-on-surface">
                      {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                    </span>
                    <div>
                      <p className="text-body-sm font-semibold text-on-surface">{u.firstName} {u.lastName}</p>
                      <p className="text-body-sm text-on-surface-variant">{u.email}</p>
                    </div>
                  </div>
                  <Badge tone="warning">Token pendiente</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <header className="card-header">
            <h2 className="text-heading-md">Atajos</h2>
          </header>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <a href="/admin/usuarios" className="btn btn-md btn-secondary"><Icon name="group" size="sm" /> Gestión de usuarios</a>
            <a href="/admin/usuarios/nuevo" className="btn btn-md btn-secondary"><Icon name="person_add" size="sm" /> Crear usuario</a>
            <a href="/personal" className="btn btn-md btn-secondary"><Icon name="badge" size="sm" /> Gestión de personal</a>
            <a href="/supervisor" className="btn btn-md btn-secondary"><Icon name="monitoring" size="sm" /> Panel supervisor</a>
          </div>
        </section>
      </div>

      <div className="text-right">
        <Button variant="ghost" onClick={() => { stats.refresh(); }}><Icon name="refresh" size="sm" /> Actualizar</Button>
      </div>
    </div>
  );
}
