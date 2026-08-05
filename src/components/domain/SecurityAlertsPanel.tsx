import { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { useResource } from "@/hooks/useResource";
import { apiFetch, isApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { AccessAlertDto } from "@/types";

const tipoLabel: Record<AccessAlertDto["tipo"], string> = {
  DENEGACIONES_REPETIDAS: "Denegaciones repetidas",
  ZONA_EMERGENCIA: "Emergencia de zona",
  ACCESO_FUERA_HORARIO: "Acceso fuera de horario",
};

const severidadTone: Record<AccessAlertDto["severidad"], "error" | "warning" | "info"> = {
  HIGH: "error",
  MEDIUM: "warning",
  LOW: "info",
};

const severidadLabel: Record<AccessAlertDto["severidad"], string> = {
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja",
};

const severidadIconClass: Record<AccessAlertDto["severidad"], string> = {
  HIGH: "bg-error-container text-error",
  MEDIUM: "bg-amber-100 text-amber-800",
  LOW: "bg-primary-container/30 text-primary",
};

function alertIcon(tipo: AccessAlertDto["tipo"]): string {
  if (tipo === "ZONA_EMERGENCIA") return "emergency";
  return "warning";
}

export function SecurityAlertsPanel() {
  const alerts = useResource<AccessAlertDto[]>("/api/access/alerts", { leido: false });
  const [marking, setMarking] = useState<string | null>(null);

  const handleMarkRead = async (id: string) => {
    setMarking(id);
    try {
      await apiFetch(`/api/access/alerts/${id}/leido`, { method: "PATCH" });
      toast.success("Alerta marcada como leída");
      alerts.refresh();
    } catch (e) {
      if (isApiError(e)) toast.error(e.message);
      else toast.error("No se pudo marcar la alerta");
    } finally {
      setMarking(null);
    }
  };

  return (
    <section className="card">
      <header className="card-header">
        <h2 className="text-heading-md">Alertas de seguridad</h2>
        <span className="label-caps">{alerts.data?.length ?? 0} PENDIENTES</span>
      </header>

      {alerts.loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : alerts.error ? (
        <ErrorState message={alerts.error.message} onRetry={alerts.refresh} />
      ) : alerts.data && alerts.data.length > 0 ? (
        <ul className="divide-y divide-outline-variant">
          {alerts.data.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${severidadIconClass[a.severidad]}`}>
                  <Icon name={alertIcon(a.tipo)} size="sm" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-body-sm font-semibold text-on-surface">{tipoLabel[a.tipo]}</p>
                    <Badge tone={severidadTone[a.severidad]}>{severidadLabel[a.severidad]}</Badge>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">{a.message}</p>
                  <p className="text-body-sm text-on-surface-variant/70">
                    {formatDateTime(a.timestamp)}
                    {a.productionAreaName ? ` · ${a.productionAreaName}` : ""}
                    {a.employeeCode ? ` · ${a.employeeCode}` : ""}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="secondary" loading={marking === a.id} onClick={() => handleMarkRead(a.id)}>
                <Icon name="done" size="sm" /> Leída
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Sin alertas pendientes" description="No hay anomalías de acceso por revisar." icon="verified" />
      )}
    </section>
  );
}
