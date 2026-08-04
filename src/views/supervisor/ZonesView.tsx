import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { StatusPill } from "@/components/common/StatusPill";
import { useResource } from "@/hooks/useResource";
import { useZoneStream } from "@/hooks/useZoneStream";
import { apiFetch, isApiError } from "@/lib/api";
import type { AccessAlertDto, AccessResult, AreaOccupancy } from "@/types";

const SEVERITY_TONE: Record<string, "active" | "warning" | "error"> = {
  LOW: "active",
  MEDIUM: "warning",
  HIGH: "error",
};

function formatTime(value: string) {
  const d = new Date(value);
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

export function ZonesView() {
  const stream = useZoneStream();
  const alertsResource = useResource<AccessAlertDto[]>("/api/access/alerts");
  const [toggling, setToggling] = useState<string | null>(null);

  const alerts = alertsResource.data ?? stream.alerts;
  const combinedAlerts = stream.alerts.length > 0 ? stream.alerts : alerts;

  const onToggleEmergency = async (zoneName: string, current: boolean) => {
    setToggling(zoneName);
    try {
      const res = await apiFetch<{ message: string }>(
        `/api/access/zones/${encodeURIComponent(zoneName)}/emergency`,
        { method: "POST", body: { cerrada: !current } },
      );
      toast.success(res.message);
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo actualizar la zona");
    } finally {
      setToggling(null);
    }
  };

  const totalPeople = stream.occupancy.reduce((acc, a) => acc + a.aforo, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zonas en vivo"
        subtitle="Ocupación, cierre de emergencia y alertas en tiempo real"
        actions={
          <Badge tone={stream.connected ? "active" : "warning"}>
            {stream.connected ? "Conectado" : "Reconectando…"}
          </Badge>
        }
      />

      {stream.error && !stream.connected ? (
        <p className="text-body-sm text-warning">{stream.error}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="card space-y-3 lg:col-span-2">
          <header className="card-header">
            <h2 className="text-heading-md">Ocupación por zona</h2>
            <span className="label-caps">{totalPeople} personas dentro</span>
          </header>

          {stream.zones.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">Sin zonas registradas.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {stream.zones.map((zone) => {
                const occ: AreaOccupancy | undefined = stream.occupancy.find((o) => o.area === zone.name);
                return (
                  <article key={zone.name} className={`rounded-lg border p-3 ${zone.emergencyClosed ? "border-error/40 bg-error-container/10" : "border-outline-variant"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-on-surface">{zone.name}</p>
                      <Badge tone={zone.emergencyClosed ? "error" : "active"}>
                        {zone.emergencyClosed ? "EMERGENCIA" : "Operativa"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                      Aforo: <b className="text-on-surface">{occ?.aforo ?? 0}</b>
                    </p>
                    {occ && occ.people.length > 0 ? (
                      <ul className="mt-2 space-y-1">
                        {occ.people.map((p) => (
                          <li key={p.employeeCode} className="flex items-center justify-between text-body-sm">
                            <span>{p.nombre}</span>
                            <span className="font-mono text-on-surface-variant">
                              {p.employeeCode} · {formatTime(p.entryTime)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-body-sm text-on-surface-variant">Sin personas dentro.</p>
                    )}
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant={zone.emergencyClosed ? "secondary" : "danger"}
                        loading={toggling === zone.name}
                        onClick={() => onToggleEmergency(zone.name, zone.emergencyClosed)}
                      >
                        <Icon name={zone.emergencyClosed ? "lock_open" : "warning"} size="sm" />
                        {zone.emergencyClosed ? "Reabrir zona" : "Cerrar por emergencia"}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="card space-y-3">
          <header className="card-header">
            <h2 className="text-heading-md">Alertas</h2>
            <span className="label-caps">{combinedAlerts.length}</span>
          </header>
          {combinedAlerts.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">Sin alertas registradas.</p>
          ) : (
            <ul className="max-h-80 divide-y divide-outline-variant overflow-auto">
              {combinedAlerts.map((a) => (
                <li key={a.id} className="flex items-start gap-2 py-2">
                  <span className="mt-0.5">
                    <Badge tone={SEVERITY_TONE[a.severidad]}>{a.severidad}</Badge>
                  </span>
                  <div className="min-w-0">
                    <p className="text-body-sm text-on-surface">{a.message}</p>
                    <p className="text-body-sm text-on-surface-variant">
                      {formatTime(a.timestamp)} {a.productionAreaName ? `· ${a.productionAreaName}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card space-y-3">
        <header className="card-header">
          <h2 className="text-heading-md">Validaciones recientes</h2>
          <span className="label-caps">En vivo</span>
        </header>
        {stream.validations.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">
            Aún no hay validaciones en esta sesión. Usa <b>Validar Credencial</b> para registrar accesos.
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {stream.validations.map((v, i) => (
              <li key={`${v.timestamp}-${i}`} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div className="flex items-center gap-2">
                  <StatusPill status={v.result as AccessResult} />
                  <span className="text-body-sm text-on-surface">{v.message}</span>
                  <span className="text-body-sm text-on-surface-variant">
                    {v.employeeCode} · {v.area}
                  </span>
                </div>
                <span className="text-body-sm text-on-surface-variant">{formatTime(v.timestamp)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
