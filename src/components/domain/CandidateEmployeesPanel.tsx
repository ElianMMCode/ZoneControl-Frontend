import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { RolePill } from "@/components/common/RolePill";
import type { EmployeeSearchResponse } from "@/types";

export function CandidateEmployeesPanel({
  candidates,
  loading,
  error,
  onRefresh,
}: {
  candidates: EmployeeSearchResponse[];
  loading: boolean;
  error: { message: string } | null;
  onRefresh: () => void;
}) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="card">
        <header className="card-header">
          <h2 className="text-heading-md">Empleados pendientes de activación</h2>
        </header>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card">
        <header className="card-header">
          <h2 className="text-heading-md">Empleados pendientes de activación</h2>
        </header>
        <ErrorState message={error.message} onRetry={onRefresh} />
      </section>
    );
  }

  return (
    <section className="card">
      <header className="card-header">
        <h2 className="text-heading-md">Empleados pendientes de activación</h2>
        <span className="label-caps text-primary">{candidates.length} CANDIDATOS</span>
      </header>
      {candidates.length === 0 ? (
        <EmptyState
          title="Sin candidatos"
          description="No hay empleados marcados con un rol de sistema pendientes de activación."
          icon="how_to_reg"
        />
      ) : (
        <ul className="divide-y divide-outline-variant">
          {candidates.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-container font-mono text-body-sm text-on-surface">
                  {e.firstName.charAt(0)}{e.lastName.charAt(0)}
                </span>
                <div>
                  <p className="text-body-sm font-semibold text-on-surface">
                    {e.firstName} {e.lastName}
                    <code className="ml-2 font-mono text-body-sm text-on-surface-variant">{e.employeeCode}</code>
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    {e.position} · {e.departmentName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {e.systemRole ? <RolePill role={e.systemRole} /> : null}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/admin/usuarios/nuevo?employeeCode=${e.employeeCode}`)}
                >
                  <Icon name="person_add" size="sm" /> Activar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
