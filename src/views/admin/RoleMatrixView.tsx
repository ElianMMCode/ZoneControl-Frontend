import { PageHeader } from "@/components/common/PageHeader";
import { RolePill } from "@/components/common/RolePill";
import { Icon } from "@/components/ui/Icon";
import type { Role } from "@/types";

type Cell = boolean;

type Row = {
  module: string;
  icon: string;
  cells: Record<Role, Cell>;
  note?: string;
};

const ROLES: Role[] = ["ADMIN", "GESTOR_PERSONAL", "SUPERVISOR_AUDITOR"];

const ROWS: Row[] = [
  { module: "Usuarios del sistema", icon: "group", cells: { ADMIN: true, GESTOR_PERSONAL: false, SUPERVISOR_AUDITOR: false } },
  { module: "Contenido público", icon: "public", cells: { ADMIN: true, GESTOR_PERSONAL: false, SUPERVISOR_AUDITOR: false } },
  { module: "Áreas de producción", icon: "domain", cells: { ADMIN: true, GESTOR_PERSONAL: true, SUPERVISOR_AUDITOR: false } },
  { module: "Gestión de personal", icon: "badge", cells: { ADMIN: true, GESTOR_PERSONAL: true, SUPERVISOR_AUDITOR: false } },
  { module: "Permisos de acceso", icon: "vpn_key", cells: { ADMIN: true, GESTOR_PERSONAL: true, SUPERVISOR_AUDITOR: false } },
  { module: "Control de acceso físico", icon: "meeting_room", cells: { ADMIN: true, GESTOR_PERSONAL: false, SUPERVISOR_AUDITOR: true } },
  { module: "Reportes / Auditoría", icon: "summarize", cells: { ADMIN: true, GESTOR_PERSONAL: false, SUPERVISOR_AUDITOR: true } },
  { module: "Ajustes / Perfil", icon: "settings", cells: { ADMIN: true, GESTOR_PERSONAL: true, SUPERVISOR_AUDITOR: true } },
];

export function RoleMatrixView() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Matriz de Roles y Permisos"
        subtitle="Consulta de permisos por módulo y rol (solo lectura — los roles son fijos en SecurityConfig)"
      />

      <section className="card space-y-4">
        <header className="card-header">
          <h2 className="text-heading-md">Matriz de acceso</h2>
          <span className="label-caps">3 roles activos</span>
        </header>
        <div className="overflow-x-auto rounded-lg border border-outline-variant">
          <table className="data-table">
            <thead>
              <tr>
                <th>Módulo</th>
                {ROLES.map((r) => (
                  <th key={r} className="text-center">
                    <RolePill role={r} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.module}>
                  <td>
                    <span className="flex items-center gap-2 text-body-md">
                      <Icon name={row.icon} size="sm" className="text-on-surface-variant" />
                      {row.module}
                    </span>
                  </td>
                  {ROLES.map((r) => (
                    <td key={r} className="text-center">
                      {row.cells[r] ? (
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
        <p className="text-body-sm text-on-surface-variant">
          Matriz reconstruida a partir de las reglas de <code className="font-mono">SecurityConfig</code>. No existe
          edición ni enforcement en base de datos (los roles son ADMIN, GESTOR_PERSONAL y SUPERVISOR_AUDITOR).
        </p>
      </section>
    </div>
  );
}
