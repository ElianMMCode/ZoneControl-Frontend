import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { useUserMutations } from "@/hooks/useUsers";
import type { UserResponse } from "@/types";

export function PendingUsersPanel({
  users,
  loading,
  error,
  onRefresh,
  onResolved,
  currentUserId,
}: {
  users: UserResponse[];
  loading: boolean;
  error: { message: string } | null;
  onRefresh: () => void;
  onResolved: () => void;
  currentUserId?: string;
}) {
  const { resetPassword, loading: resetting } = useUserMutations();

  const handleResend = async (u: UserResponse) => {
    const msg = await resetPassword(u.id);
    if (msg) {
      toast.success("Enlace reenviado", { description: `Se envió un nuevo enlace a ${u.email}.` });
      onResolved();
    } else {
      toast.error("No se pudo reenviar el enlace");
    }
  };

  if (loading) {
    return (
      <section className="card">
        <header className="card-header">
          <h2 className="text-heading-md">Usuarios sin configuración</h2>
        </header>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card">
        <header className="card-header">
          <h2 className="text-heading-md">Usuarios sin configuración</h2>
        </header>
        <ErrorState message={error.message} onRetry={onRefresh} />
      </section>
    );
  }

  return (
    <section className="card">
      <header className="card-header">
        <h2 className="text-heading-md">Usuarios sin configuración</h2>
        <span className="label-caps text-error">{users.length} PENDIENTES</span>
      </header>
      {users.length === 0 ? (
        <EmptyState
          title="Sin pendientes"
          description="Todos los usuarios han completado la configuración de su contraseña."
          icon="check_circle"
        />
      ) : (
        <ul className="divide-y divide-outline-variant">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-container font-mono text-body-sm text-on-surface">
                  {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                </span>
                <div>
                  <p className="text-body-sm font-semibold text-on-surface">{u.firstName} {u.lastName}</p>
                  <p className="text-body-sm text-on-surface-variant">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge-error">Token pendiente</span>
                {u.id !== currentUserId ? (
                  <Button variant="secondary" size="sm" onClick={() => handleResend(u)} loading={resetting}>
                    <Icon name="send" size="sm" /> Reenviar enlace
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
