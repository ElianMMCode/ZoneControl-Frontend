import { PageHeader } from "@/components/common/PageHeader";
import { RolePill } from "@/components/common/RolePill";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { useResource } from "@/hooks/useResource";
import type { Role } from "@/types";

type AccessMap = Record<Role, boolean>;
type ModuleRow = { module: string; icon: string; access: AccessMap };
type RoleMatrixResponse = { roles: Role[]; modules: ModuleRow[] };

const FALLBACK_ROLES: Role[] = ["ADMIN", "GESTOR_PERSONAL", "SUPERVISOR_AUDITOR"];

function access(...allowed: Role[]): AccessMap {
  return {
    ADMIN: allowed.includes("ADMIN"),
    GESTOR_PERSONAL: allowed.includes("GESTOR_PERSONAL"),
    SUPERVISOR_AUDITOR: allowed.includes("SUPERVISOR_AUDITOR"),
  };
}

const FALLBACK_ROWS: ModuleRow[] = [
  { module: "Usuarios del sistema", icon: "group", access: access("ADMIN") },
  { module: "Contenido público", icon: "public", access: access("ADMIN") },
  { module: "Áreas de producción", icon: "domain", access: access("ADMIN", "GESTOR_PERSONAL") },
  { module: "Gestión de personal", icon: "badge", access: access("ADMIN", "GESTOR_PERSONAL") },
  { module: "Permisos de acceso", icon: "vpn_key", access: access("ADMIN", "GESTOR_PERSONAL") },
  { module: "Control de acceso físico", icon: "meeting_room", access: access("ADMIN", "SUPERVISOR_AUDITOR") },
  { module: "Reportes / Auditoría", icon: "summarize", access: access("ADMIN", "SUPERVISOR_AUDITOR") },
  { module: "Ajustes / Perfil", icon: "settings", access: access("ADMIN", "GESTOR_PERSONAL", "SUPERVISOR_AUDITOR") },
];

export function RoleMatrixView() {
  const matrix = useResource<RoleMatrixResponse>("/api/admin/role-matrix");
  const rows = matrix.data?.modules ?? FALLBACK_ROWS;
  const roles = matrix.data?.roles ?? FALLBACK_ROLES;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matriz de Roles y Permisos"
        subtitle="Consulta de permisos por módulo y rol (solo lectura — los roles son fijos en SecurityConfig)"
      />

      <section className="card space-y-4">
        <header className="card-header">
          <h2 className="text-heading-md">Matriz de acceso</h2>
          <span className="label-caps">{roles.length} roles activos</span>
        </header>

        {matrix.loading ? (
          <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-outline-variant">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Módulo</th>
                  {roles.map((r) => (
                    <th key={r} className="text-center">
                      <RolePill role={r} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.module}>
                    <td>
                      <span className="flex items-center gap-2 text-body-md">
                        <Icon name={row.icon} size="sm" className="text-on-surface-variant" />
                        {row.module}
                      </span>
                    </td>
                    {roles.map((r) => (
                      <td key={r} className="text-center">
                        {row.access[r] ? (
                          <span className="inline-grid h-7 w-7 place-items-center rounded-full bg-secondary-container text-secondary">
                            <Icon name="check" size="sm" />
                          </span>
                        ) : (
                          <span className="text-on-surface-variant">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-body-sm text-on-surface-variant">
          {matrix.data
            ? "Matriz reconstruida desde el backend (GET /api/admin/role-matrix), alineada con SecurityConfig."
            : "Mostrando la matriz por defecto (el endpoint /api/admin/role-matrix no respondió)."}
        </p>
      </section>
    </div>
  );
}
