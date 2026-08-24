import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { Role } from "@/types";

type Item = {
  to: string;
  label: string;
  icon: string;
  roles: ReadonlyArray<Role>;
  end?: boolean;
};

const items: Item[] = [
  { to: "/admin/dashboard", label: "Panel Administración", icon: "dashboard", roles: ["ADMIN"] },
  { to: "/admin/usuarios", label: "Usuarios", icon: "group", roles: ["ADMIN"], end: true },
  { to: "/admin/matriz-roles", label: "Roles", icon: "verified_user", roles: ["ADMIN"] },
  { to: "/admin/areas", label: "Áreas", icon: "domain", roles: ["ADMIN"] },
  { to: "/admin/cargos", label: "Cargos", icon: "badge", roles: ["ADMIN"] },
  { to: "/admin/contenido-publico", label: "Contenido Público", icon: "public", roles: ["ADMIN"] },
  { to: "/personal", label: "Gestión Personal", icon: "badge", roles: ["GESTOR_PERSONAL"], end: true },
  { to: "/personal/nuevo", label: "Registrar Personal", icon: "person_add", roles: ["GESTOR_PERSONAL"] },
  { to: "/personal/carga-masiva", label: "Carga Masiva", icon: "upload_file", roles: ["GESTOR_PERSONAL"] },
  { to: "/permisos", label: "Permisos", icon: "vpn_key", roles: ["GESTOR_PERSONAL"] },
  { to: "/personal/historial", label: "Historial de Accesos", icon: "history", roles: ["ADMIN", "GESTOR_PERSONAL"] },
  { to: "/supervisor", label: "Panel Supervisión", icon: "monitoring", roles: ["SUPERVISOR_AUDITOR"], end: true },
  { to: "/supervisor/zones", label: "Zonas", icon: "location_on", roles: ["SUPERVISOR_AUDITOR"] },
  { to: "/supervisor/reportes", label: "Reportes", icon: "summarize", roles: ["ADMIN", "SUPERVISOR_AUDITOR"] },
];

export function Sidebar({ role }: { role: Role | null }) {
  const [collapsed, setCollapsed] = useState(false);
  const visible = items.filter((i) => role && i.roles.includes(role));

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest transition-[width] duration-200 lg:flex",
        collapsed ? "w-16" : "w-70",
      )}
    >
      <div className="flex h-16 items-center gap-1 border-b border-outline-variant px-3">
        {collapsed ? (
          <button
            type="button"
            aria-label="Mostrar menú"
            onClick={() => setCollapsed(false)}
            className="mx-auto rounded-md p-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Icon name="menu_open" size="sm" />
          </button>
        ) : (
          <>
            <Link
              to="/"
              title="Volver al inicio"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-on-primary">
                <Icon name="verified_user" size="md" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-body-sm font-bold text-on-surface">Laboratorio XYZ</span>
                <span className="label-caps">Sistema de acceso</span>
              </span>
            </Link>
            <button
              type="button"
              aria-label="Ocultar menú"
              onClick={() => setCollapsed(true)}
              className="rounded-md p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Icon name="menu" size="sm" />
            </button>
          </>
        )}
      </div>

      <nav aria-label="Navegación principal" className="flex-1 space-y-1 overflow-y-auto p-3">
        {visible.map((item) =>
          collapsed ? (
            <NavLink key={item.to} to={item.to} end={item.end} title={item.label} className="sidebar-link justify-center">
              <Icon name={item.icon} size="sm" />
            </NavLink>
          ) : (
            <NavLink key={item.to} to={item.to} end={item.end} className="sidebar-link">
              <Icon name={item.icon} size="sm" />
              <span>{item.label}</span>
            </NavLink>
          ),
        )}
      </nav>
    </aside>
  );
}
