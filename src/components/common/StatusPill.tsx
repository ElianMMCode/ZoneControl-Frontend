import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { AccessResult, EmployeeStatus, PermissionStatus, UserStatus } from "@/types";

type Status = UserStatus | EmployeeStatus | PermissionStatus | AccessResult | string;

const statusTone: Record<string, BadgeTone> = {
  ACTIVO: "active",
  ACTIVE: "active",
  INACTIVO: "inactive",
  INACTIVE: "inactive",
  SUSPENDIDO: "warning",
  SUSPENDED: "warning",
  AUTHORIZED: "active",
  DENIED: "error",
  UNREGISTERED: "error",
  EXIT: "inactive",
  CANCELLED: "error",
};

const statusLabel: Record<string, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  SUSPENDIDO: "Suspendido",
  AUTHORIZED: "Autorizado",
  DENIED: "Denegado",
  UNREGISTERED: "No registrado",
  SUSPENDED: "Suspendido",
  EXIT: "Salida",
};

export function StatusPill({ status }: { status: Status }) {
  const tone = statusTone[status] ?? "inactive";
  return <Badge tone={tone}>{statusLabel[status] ?? status}</Badge>;
}
