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
  INTENTOS_REPETIDOS_ZONA: "Intentos repetidos en zona",
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
  if (tipo === "INTENTOS_REPETIDOS_ZONA") return "siren";
  return "warning";
}

type AlertListProps = {
  title: string;
  subtitle: string;
  icon: string;
  tone: string;
  items: AccessAlertDto[];
  marking: string | null;
  onMarkRead: (id: string) => void;
};

function AlertSection({ title, subtitle, icon, tone, items, marking, onMarkRead }: AlertListProps) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 py-3">
        <span className={`grid h-7 w-7 place-items-center rounded-full ${tone}`}>
          <Icon name={icon} size="sm" />
        </span>
        <div className="min-w-0">
          <h3 className="text-body-sm font-bold text-on-surface">{title}</h3>
          <p className="text-body-sm text-on-surface-variant">{subtitle}</p>
        </div>
        <span className="label-caps ml-auto">{items.length} ALERTA{items.length === 1 ? "" : "S"}</span>
      </div>
      <ul className="divide-y divide-outline-variant border-t border-outline-variant/60">
        {items.map((a) => (
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
            <Button size="sm" variant="secondary" loading={marking === a.id} onClick={() => onMarkRead(a.id)}>
              <Icon name="done" size="sm" /> Leída
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
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
        <div className="space-y-4">
          <AlertSection
            title="Con cuenta de sistema"
            subtitle="Empleados con usuario registrado en la plataforma"
            icon="manage_accounts"
            tone="bg-primary-container/30 text-primary"
            items={alerts.data.filter((a) => a.hasUser)}
            marking={marking}
            onMarkRead={handleMarkRead}
          />
          <AlertSection
            title="Sin cuenta de sistema"
            subtitle="Empleados solo con acceso físico, zonas u orígenes desconocidos"
            icon="person_off"
            tone="bg-tertiary-container/40 text-on-tertiary-container"
            items={alerts.data.filter((a) => !a.hasUser)}
            marking={marking}
            onMarkRead={handleMarkRead}
          />
        </div>
      ) : (
        <EmptyState title="Sin alertas pendientes" description="No hay anomalías de acceso por revisar." icon="verified" />
      )}
    </section>
  );
}
