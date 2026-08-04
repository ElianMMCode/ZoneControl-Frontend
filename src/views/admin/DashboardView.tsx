import { useMemo } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { QuickActions } from "@/components/common/QuickActions";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useResource } from "@/hooks/useResource";
import { useAuth } from "@/hooks/useAuth";
import { userListQuery } from "@/hooks/useUsers";
import { PendingUsersPanel } from "@/components/domain/PendingUsersPanel";
import { RecentActivityList } from "@/components/domain/RecentActivityList";
import { CandidateEmployeesPanel } from "@/components/domain/CandidateEmployeesPanel";
import { formatNumber } from "@/lib/format";
import type {
  AccessHistoryResponse,
  AdminStatsResponse,
  EmployeeSearchResponse,
  Page,
  UserResponse,
} from "@/types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function percent(value: number, total: number): number {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const stats = useResource<AdminStatsResponse>("/api/admin/stats");

  const pendingQuery = useMemo(() => userListQuery({ pendientesConfiguracion: true, size: 20 }), []);
  const pendingUsers = useResource<Page<UserResponse>>(
    "/api/admin/users",
    pendingQuery,
    [pendingQuery.pendientesConfiguracion, pendingQuery.size],
  );

  const candidates = useResource<Page<EmployeeSearchResponse>>(
    "/api/admin/users/candidatos",
    { size: 20, page: 0 },
  );

  const history = useResource<Page<AccessHistoryResponse>>("/api/historial", {
    fechaInicio: todayIso(),
    fechaFin: todayIso(),
    page: 0,
    size: 5,
  });

  const refreshAll = () => {
    stats.refresh();
    pendingUsers.refresh();
    candidates.refresh();
    history.refresh();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Panel de Administración"
        subtitle="Resumen general del sistema"
        actions={
          <Button variant="ghost" onClick={refreshAll}>
            <Icon name="refresh" size="sm" /> Actualizar
          </Button>
        }
      />

      {stats.loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : stats.error ? (
        <ErrorState message={stats.error.message} onRetry={stats.refresh} />
      ) : stats.data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Usuarios activos"
            value={formatNumber(stats.data.usuariosActivos)}
            delta={`de ${formatNumber(stats.data.totalUsuarios)} totales`}
            icon="people"
            progress={{ percent: percent(stats.data.usuariosActivos, stats.data.totalUsuarios) }}
          />
          <StatCard
            label="Empleados"
            value={formatNumber(stats.data.totalEmpleados)}
            delta={`${formatNumber(stats.data.empleadosActivos)} activos`}
            icon="badge"
            tone="secondary"
            progress={{ percent: percent(stats.data.empleadosActivos, stats.data.totalEmpleados), tone: "secondary" }}
          />
          <StatCard
            label="Permisos activos"
            value={formatNumber(stats.data.permisosActivos)}
            delta={`${formatNumber(stats.data.permisosSuspendidos)} suspendidos`}
            icon="vpn_key"
          />
          <StatCard
            label="Pendientes de configuración"
            value={formatNumber(stats.data.usuariosSinConfiguracion)}
            delta="Requieren activar su cuenta"
            icon="pending_actions"
            tone={stats.data.usuariosSinConfiguracion > 0 ? "error" : "primary"}
          />
        </div>
      ) : null}

      <QuickActions
        actions={[
          { label: "Crear usuario", icon: "person_add", to: "/admin/usuarios/nuevo", description: "Vincular un empleado como usuario del sistema" },
          { label: "Gestión de usuarios", icon: "group", to: "/admin/usuarios" },
          { label: "Contenido público", icon: "public", to: "/admin/contenido-publico" },
          { label: "Áreas de producción", icon: "domain", to: "/admin/areas" },
          { label: "Matriz de roles", icon: "verified_user", to: "/admin/matriz-roles" },
          { label: "Exportar historial", icon: "summarize", to: "/supervisor/reportes" },
        ]}
      />

      <CandidateEmployeesPanel
        candidates={candidates.data?.content ?? []}
        loading={candidates.loading}
        error={candidates.error ? { message: candidates.error.message } : null}
        onRefresh={candidates.refresh}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PendingUsersPanel
          users={pendingUsers.data?.content ?? []}
          loading={pendingUsers.loading}
          error={pendingUsers.error ? { message: pendingUsers.error.message } : null}
          onRefresh={pendingUsers.refresh}
          onResolved={pendingUsers.refresh}
          currentUserId={currentUser?.id}
        />
        <RecentActivityList
          events={history.data?.content ?? []}
          loading={history.loading}
          error={history.error ? { message: history.error.message } : null}
          onRefresh={history.refresh}
        />
      </div>
    </div>
  );
}
