import { Badge } from "@/components/ui/Badge";
import type { Role } from "@/types";

const roleTone: Record<Role, "info" | "active" | "warning"> = {
  ADMIN: "info",
  GESTOR_PERSONAL: "active",
  SUPERVISOR_AUDITOR: "warning",
};

const roleLabel: Record<Role, string> = {
  ADMIN: "Admin",
  GESTOR_PERSONAL: "Gestor",
  SUPERVISOR_AUDITOR: "Supervisor",
};

export function RolePill({ role }: { role: Role }) {
  return <Badge tone={roleTone[role]}>{roleLabel[role]}</Badge>;
}
