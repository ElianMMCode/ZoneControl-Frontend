import { NavLink } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import type { Role } from "@/types";

type Item = {
  to: string;
  label: string;
  icon: string;
  roles: ReadonlyArray<Role>;
};

const items: Item[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard", roles: ["ADMIN"] },
  { to: "/admin/usuarios", label: "Usuarios", icon: "group", roles: ["ADMIN"] },
  { to: "/personal", label: "Gestión Personal", icon: "badge", roles: ["GESTOR_PERSONAL"] },
  { to: "/supervisor", label: "Dashboard", icon: "monitoring", roles: ["SUPERVISOR_AUDITOR"] },
];

export function Sidebar({ role }: { role: Role | null }) {
  const visible = items.filter((i) => role && i.roles.includes(role));
  return (
    <aside className="hidden w-70 shrink-0 border-r border-outline-variant bg-surface-container-lowest lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-outline-variant px-5">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-on-primary">
          <Icon name="verified_user" size="md" />
        </span>
        <div>
          <p className="text-body-sm font-bold text-on-surface">ZoneControl</p>
          <p className="label-caps">Laboratorio XYZ</p>
        </div>
      </div>
      <nav aria-label="Navegación principal" className="flex-1 space-y-1 p-3">
        {visible.map((item) => (
          <NavLink key={item.to} to={item.to} className="sidebar-link">
            <Icon name={item.icon} size="sm" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
