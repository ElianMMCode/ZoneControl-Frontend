import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusPill } from "@/components/common/StatusPill";
import { RolePill } from "@/components/common/RolePill";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tooltip } from "@/components/ui/Tooltip";
import type { UserResponse } from "@/types";

export function UserTable({
  data,
  onEdit,
  onToggleStatus,
  onResetPassword,
  currentUserId,
}: {
  data: UserResponse[];
  onEdit: (u: UserResponse) => void;
  onToggleStatus: (u: UserResponse) => void;
  onResetPassword: (u: UserResponse) => void;
  currentUserId?: string;
}) {
  const isCurrentUser = (u: UserResponse) => u.id === currentUserId;

  const columns: Column<UserResponse>[] = [
    { key: "name", header: "Nombre", render: (u) => `${u.firstName} ${u.lastName}` },
    { key: "email", header: "Email", render: (u) => u.email },
    { key: "role", header: "Rol", render: (u) => <RolePill role={u.role} /> },
    { key: "status", header: "Estado", render: (u) => <StatusPill status={u.status} /> },
    {
      key: "activacion",
      header: "Activación",
      render: (u) =>
        u.pendienteActivacion ? (
          <Badge tone="warning" icon={<Icon name="schedule" size="sm" />}>Pendiente</Badge>
        ) : (
          <Badge tone="info" icon={<Icon name="check_circle" size="sm" />}>Completada</Badge>
        ),
    },
    { key: "code", header: "Código", render: (u) => <code className="font-mono text-body-sm">{u.employeeCode}</code> },
    {
      key: "actions",
      header: "Acciones",
      align: "right",
      render: (u) =>
        isCurrentUser(u) ? (
          <span className="label-caps text-on-surface-variant">Tú</span>
        ) : (
          <div className="flex justify-end gap-1">
            <Tooltip label="Editar usuario">
              <Button variant="ghost" size="sm" onClick={() => onEdit(u)} aria-label={`Editar ${u.firstName} ${u.lastName}`}>
                <Icon name="edit" size="sm" />
              </Button>
            </Tooltip>
            <Tooltip label={u.status === "ACTIVO" ? "Desactivar usuario" : "Activar usuario"}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleStatus(u)}
                aria-label={u.status === "ACTIVO" ? `Desactivar ${u.firstName}` : `Activar ${u.firstName}`}
              >
                <Icon name={u.status === "ACTIVO" ? "power_settings_new" : "check_circle"} size="sm" />
              </Button>
            </Tooltip>
            <Tooltip label="Restablecer contraseña">
              <Button variant="ghost" size="sm" onClick={() => onResetPassword(u)} aria-label={`Restablecer contraseña de ${u.firstName}`}>
                <Icon name="key" size="sm" />
              </Button>
            </Tooltip>
          </div>
        ),
    },
  ];
  return <DataTable columns={columns} data={data} rowKey={(u) => u.id} />;
}
