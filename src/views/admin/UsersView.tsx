import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { Pagination } from "@/components/common/Pagination";
import { UserTable } from "@/components/domain/UserTable";
import { UserFormModal } from "@/components/domain/UserFormModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectField, Option } from "@/components/ui/Select";
import { ErrorState, EmptyState } from "@/components/ui/EmptyState";
import { Skeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import { useResource } from "@/hooks/useResource";
import { useUserMutations, userListQuery } from "@/hooks/useUsers";
import { formatNumber } from "@/lib/format";
import type {
  EmployeeSearchResponse,
  Page,
  Role,
  UpdateUserRequest,
  UserResponse,
  UserStatus,
} from "@/types";

export function UsersView() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [page, setPage] = useState(0);

  const query = userListQuery({
    search,
    role: role || undefined,
    status: status || undefined,
    page,
    size: 10,
  });
  const data = useResource<Page<UserResponse>>("/api/admin/users", query, [
    search,
    role,
    status,
    page,
  ]);
  const candidates = useResource<Page<EmployeeSearchResponse>>(
    "/api/admin/users/candidatos",
    { size: 1, page: 0 },
  );

  const [editing, setEditing] = useState<UserResponse | null>(null);
  const [toggling, setToggling] = useState<UserResponse | null>(null);
  const [resetting, setResetting] = useState<UserResponse | null>(null);

  const {
    update,
    updateStatus,
    resetPassword,
    error,
    loading: mutating,
  } = useUserMutations();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Usuarios"
        subtitle="Administra los usuarios del sistema y sus roles"
        actions={
          <Link to="/admin/usuarios/nuevo">
            <Button>
              <Icon name="person_add" size="sm" /> Crear usuario
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {candidates.loading ? (
          <Skeleton className="h-28 w-full rounded-lg" />
        ) : (
          <StatCard
            label="Empleados pendientes de configuración"
            value={formatNumber(candidates.data?.totalElements ?? 0)}
            delta="Sin cuenta de sistema"
            icon="pending_actions"
            tone={candidates.data && candidates.data.totalElements > 0 ? "secondary" : "primary"}
          />
        )}
        {data.data ? (
          <StatCard
            label="Usuarios totales"
            value={formatNumber(data.data.totalElements)}
            delta={`página ${data.data.number + 1} de ${data.data.totalPages || 1}`}
            icon="group"
          />
        ) : null}
      </div>

      <section className="card space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <SearchInput
              id="filter-search"
              label="Buscar"
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(0);
              }}
              placeholder="Buscar por nombre, email o código..."
              ariaLabel="Buscar usuarios"
            />
          </div>
          <SelectField id="filter-role" label="Rol">
            <Select
              id="filter-role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value as Role | "");
                setPage(0);
              }}
            >
              <Option value="">Todos</Option>
              <Option value="ADMIN">Admin</Option>
              <Option value="GESTOR_PERSONAL">Gestor Personal</Option>
              <Option value="SUPERVISOR_AUDITOR">Supervisor Auditor</Option>
            </Select>
          </SelectField>
          <SelectField id="filter-status" label="Estado">
            <Select
              id="filter-status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as UserStatus | "");
                setPage(0);
              }}
            >
              <Option value="">Todos</Option>
              <Option value="ACTIVO">Activo</Option>
              <Option value="INACTIVO">Inactivo</Option>
            </Select>
          </SelectField>
        </div>

        {data.loading ? (
          <div className="overflow-x-auto rounded-lg border border-outline-variant">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Código</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={7} />
                ))}
              </tbody>
            </table>
          </div>
        ) : data.error ? (
          <ErrorState message={data.error.message} onRetry={data.refresh} />
        ) : data.data && data.data.content.length > 0 ? (
          <>
            <UserTable
              data={data.data.content}
              onEdit={(u) => setEditing(u)}
              onToggleStatus={(u) => setToggling(u)}
              onResetPassword={(u) => setResetting(u)}
              currentUserId={currentUser?.id}
            />
            <Pagination
              page={data.data.number}
              totalPages={data.data.totalPages}
              totalElements={data.data.totalElements}
              pageSize={data.data.size}
              onPageChange={setPage}
              itemLabel="usuarios"
            />
          </>
        ) : (
          <EmptyState
            title="Sin resultados"
            description="No se encontraron usuarios con los filtros actuales."
            icon="group"
          />
        )}
      </section>

      <UserFormModal
        open={!!editing}
        user={editing}
        onClose={() => setEditing(null)}
        loading={mutating}
        onSubmit={async (values: UpdateUserRequest) => {
          if (!editing) return false;
          const ok = await update(editing.id, values);
          if (ok) {
            toast.success("Usuario actualizado");
            data.refresh();
          } else {
            toast.error(error?.message ?? "No se pudo actualizar el usuario");
          }
          return ok;
        }}
      />

      <ConfirmDialog
        open={!!toggling}
        title={
          toggling?.status === "ACTIVO"
            ? "Desactivar usuario"
            : "Activar usuario"
        }
        message={
          toggling
            ? `¿Seguro que deseas ${toggling.status === "ACTIVO" ? "desactivar" : "activar"} a ${toggling.firstName} ${toggling.lastName}?`
            : ""
        }
        tone="danger"
        confirmLabel={
          toggling?.status === "ACTIVO" ? "Sí, desactivar" : "Activar"
        }
        loading={mutating}
        onCancel={() => setToggling(null)}
        onConfirm={async () => {
          if (!toggling) return;
          const ok = await updateStatus(
            toggling.id,
            toggling.status === "ACTIVO" ? "INACTIVO" : "ACTIVO",
          );
          if (ok) {
            toast.success("Estado actualizado");
            data.refresh();
            setToggling(null);
          } else {
            toast.error(error?.message ?? "No se pudo cambiar el estado");
          }
        }}
      />

      <ConfirmDialog
        open={!!resetting}
        title="Restablecer contraseña"
        message={
          resetting
            ? `Se abrirá una nueva ventana para configurar la contraseña de ${resetting.email}. La contraseña actual dejará de ser válida y el enlace expirará en 24 horas.`
            : ""
        }
        confirmLabel="Abrir configuración"
        loading={mutating}
        onCancel={() => setResetting(null)}
        onConfirm={async () => {
          if (!resetting) return;
          const res = await resetPassword(resetting.id);
          if (res) {
            toast.success(res.message);
            window.open(res.setupUrl, "_blank", "noopener");
            setResetting(null);
          } else {
            toast.error(error?.message ?? "No se pudo enviar el enlace");
          }
        }}
      />
    </div>
  );
}
