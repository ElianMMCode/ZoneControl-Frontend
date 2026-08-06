import { PageHeader } from "@/components/common/PageHeader";
import { RolePill } from "@/components/common/RolePill";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { useResource } from "@/hooks/useResource";
import type { Role } from "@/types";

type AccessLevel = "NINGUNO" | "LECTURA" | "ESCRITURA";
type AccessMap = Record<Role, AccessLevel>;
type ModuleRow = { module: string; icon: string; access: AccessMap };
type RoleMatrixResponse = { roles: Role[]; modules: ModuleRow[] };

const FALLBACK_ROLES: Role[] = ["ADMIN", "GESTOR_PERSONAL", "SUPERVISOR_AUDITOR"];

function levels(spec: Partial<Record<Role, AccessLevel>>): AccessMap {
  return {
    ADMIN: spec.ADMIN ?? "NINGUNO",
    GESTOR_PERSONAL: spec.GESTOR_PERSONAL ?? "NINGUNO",
    SUPERVISOR_AUDITOR: spec.SUPERVISOR_AUDITOR ?? "NINGUNO",
  };
}

const FALLBACK_ROWS: ModuleRow[] = [
  { module: "Usuarios del sistema", icon: "group", access: levels({ ADMIN: "ESCRITURA" }) },
  { module: "Contenido público", icon: "public", access: levels({ ADMIN: "ESCRITURA" }) },
  { module: "Áreas de producción", icon: "domain", access: levels({ ADMIN: "ESCRITURA", GESTOR_PERSONAL: "ESCRITURA", SUPERVISOR_AUDITOR: "LECTURA" }) },
  { module: "Cargos", icon: "badge", access: levels({ ADMIN: "ESCRITURA", GESTOR_PERSONAL: "LECTURA", SUPERVISOR_AUDITOR: "LECTURA" }) },
  { module: "Gestión de personal", icon: "groups", access: levels({ ADMIN: "ESCRITURA", GESTOR_PERSONAL: "ESCRITURA", SUPERVISOR_AUDITOR: "LECTURA" }) },
  { module: "Permisos de acceso", icon: "vpn_key", access: levels({ ADMIN: "ESCRITURA", GESTOR_PERSONAL: "ESCRITURA", SUPERVISOR_AUDITOR: "LECTURA" }) },
  { module: "Control de acceso físico", icon: "meeting_room", access: levels({ ADMIN: "ESCRITURA", SUPERVISOR_AUDITOR: "ESCRITURA" }) },
  { module: "Reportes / Auditoría", icon: "summarize", access: levels({ ADMIN: "ESCRITURA", SUPERVISOR_AUDITOR: "ESCRITURA" }) },
  { module: "Ajustes / Perfil", icon: "settings", access: levels({ ADMIN: "ESCRITURA", GESTOR_PERSONAL: "ESCRITURA", SUPERVISOR_AUDITOR: "ESCRITURA" }) },
];

const LEVEL_CELL: Record<AccessLevel, { icon: string; tone: string; title: string } | null> = {
  ESCRITURA: { icon: "check", tone: "bg-secondary-container text-secondary", title: "Escritura" },
  LECTURA: { icon: "visibility", tone: "bg-primary-container text-primary", title: "Lectura (solo consulta)" },
  NINGUNO: null,
};

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
          <div className="space-y-2">{Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
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
                    {roles.map((r) => {
                      const cell = LEVEL_CELL[row.access[r]] ?? null;
                      return (
                        <td key={r} className="text-center">
                          {cell ? (
                            <span
                              title={cell.title}
                              className={`inline-grid h-7 w-7 place-items-center rounded-full ${cell.tone}`}
                            >
                              <Icon name={cell.icon} size="sm" />
                            </span>
                          ) : (
                            <span className="text-on-surface-variant">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-body-sm text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-secondary-container text-secondary"><Icon name="check" size="sm" /></span>
            Escritura
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-primary-container text-primary"><Icon name="visibility" size="sm" /></span>
            Lectura (solo consulta)
          </span>
          <span className="flex items-center gap-1.5"><span className="text-on-surface-variant">—</span> Sin acceso</span>
        </div>
      </section>
    </div>
  );
}
