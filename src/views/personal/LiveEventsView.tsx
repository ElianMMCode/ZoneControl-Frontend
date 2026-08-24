import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusPill } from "@/components/common/StatusPill";
import { ErrorState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { SecurityAlertsPanel } from "@/components/domain/SecurityAlertsPanel";
import { useZoneStream, type ValidatedEvent } from "@/hooks/useZoneStream";
import { formatDateTime } from "@/lib/format";

const eventColumns: Column<ValidatedEvent>[] = [
  { key: "ts", header: "Hora", render: (e) => formatDateTime(e.timestamp) },
  { key: "code", header: "Código", render: (e) => e.employeeCode },
  { key: "emp", header: "Empleado", render: (e) => e.employeeName ?? "—" },
  { key: "area", header: "Área", render: (e) => e.area },
  {
    key: "result",
    header: "Resultado",
    render: (e) => (
      <div className="flex items-center gap-2">
        <StatusPill status={e.result} />
        <span className="text-body-sm text-on-surface-variant">{e.message}</span>
      </div>
    ),
  },
];

export function LiveEventsView() {
  const stream = useZoneStream();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Eventos en Vivo"
        subtitle="Ingresos y salidas en tiempo real en las áreas de producción"
        actions={
          <Badge tone={stream.connected ? "active" : "error"}>
            <Icon name={stream.connected ? "sensors" : "sensors_off"} size="sm" />
            {stream.connected ? "Conectado" : stream.error ? "Sin conexión" : "Conectando…"}
          </Badge>
        }
      />

      {stream.error ? (
        <ErrorState message={stream.error} onRetry={() => window.location.reload()} />
      ) : null}

      <section className="card space-y-4">
        <header className="card-header">
          <h2 className="text-heading-md">Movimientos recientes</h2>
          <span className="label-caps">TIEMPO REAL</span>
        </header>
        {stream.validations.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">
            Esperando eventos del sistema de control de acceso…
          </p>
        ) : (
          <DataTable columns={eventColumns} data={stream.validations} rowKey={(e) => `${e.timestamp}-${e.employeeCode}-${e.area}`} />
        )}
      </section>

      <SecurityAlertsPanel />

      {stream.occupancy.length > 0 ? (
        <section className="card space-y-3">
          <header className="card-header">
            <h2 className="text-heading-md">Ocupación por área</h2>
          </header>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stream.occupancy.map((o) => (
              <li key={o.area} className="rounded-lg border border-outline-variant p-4">
                <p className="text-body-sm font-semibold text-on-surface">{o.area}</p>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  Personas dentro: <strong>{o.people.length}</strong> · Aforo: {o.aforo}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
