import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { StatusPill } from "@/components/common/StatusPill";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { Select, Option } from "@/components/ui/Select";
import { FormField } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { useResource } from "@/hooks/useResource";
import { useZoneStream } from "@/hooks/useZoneStream";
import { apiFetch, isApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type {
  AccessAlertDto,
  AccessResult,
  AreaAuthorization,
  AreaEmployee,
  AreaOccupancy,
  ProductionArea,
} from "@/types";

const SEVERITY_TONE: Record<string, "active" | "warning" | "error"> = {
  LOW: "active",
  MEDIUM: "warning",
  HIGH: "error",
};

const DAY_LABEL: Record<string, string> = {
  LUN: "Lun", MAR: "Mar", MIE: "Mié", JUE: "Jue", VIE: "Vie", SAB: "Sáb", DOM: "Dom",
};

function formatTime(value: string) {
  const d = new Date(value);
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

function formatClock(value: string) {
  return value.slice(0, 5);
}

export function ZonesView() {
  const stream = useZoneStream();
  const alertsResource = useResource<AccessAlertDto[]>("/api/access/alerts");
  const [toggling, setToggling] = useState<string | null>(null);

  const [selectedZone, setSelectedZone] = useState<ProductionArea | null>(null);
  const [modalTab, setModalTab] = useState("empleados");
  const employees = useResource<AreaEmployee[]>(
    selectedZone ? `/api/permisos/areas/${encodeURIComponent(selectedZone.name)}/empleados` : null,
    {},
    [selectedZone?.name],
  );
  const authorizations = useResource<AreaAuthorization[]>(
    selectedZone ? `/api/permisos/areas/${encodeURIComponent(selectedZone.name)}/autorizaciones` : null,
    {},
    [selectedZone?.name],
  );

  const [filterArea, setFilterArea] = useState("");
  const [filterResult, setFilterResult] = useState<AccessResult | "">("");

  const alerts = alertsResource.data ?? stream.alerts;
  const combinedAlerts = stream.alerts.length > 0 ? stream.alerts : alerts;

  const validations = useMemo(() => {
    const list = stream.validations;
    return list.filter((v) => {
      if (filterArea && v.area !== filterArea) return false;
      if (filterResult && v.result !== filterResult) return false;
      return true;
    });
  }, [stream.validations, filterArea, filterResult]);

  const zoneOccupancy = selectedZone
    ? stream.occupancy.find((o) => o.area === selectedZone.name)
    : undefined;

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

  const employeeColumns: Column<AreaEmployee>[] = [
    { key: "code", header: "Código", render: (e) => <span className="font-mono text-body-sm">{e.employeeCode}</span> },
    { key: "name", header: "Empleado", render: (e) => e.employeeName },
    { key: "pos", header: "Cargo", render: (e) => e.position ?? "—" },
    { key: "dept", header: "Departamento", render: (e) => e.department ?? "—" },
    { key: "est", header: "Estado", render: (e) => <StatusPill status={e.employeeStatus} /> },
  ];

  const authColumns: Column<AreaAuthorization>[] = [
    { key: "code", header: "Código", render: (a) => <span className="font-mono text-body-sm">{a.employeeCode}</span> },
    { key: "name", header: "Empleado", render: (a) => a.employeeName },
    { key: "dept", header: "Departamento", render: (a) => a.department ?? "—" },
    { key: "status", header: "Estado permiso", render: (a) => <StatusPill status={a.permissionStatus} /> },
    {
      key: "vigencia",
      header: "Vigencia",
      render: (a) => (
        <span className="text-body-sm">
          {a.startDate} → {a.expirationDate}
          {a.reactivationDate ? ` · React: ${a.reactivationDate}` : ""}
        </span>
      ),
    },
    { key: "horario", header: "Horario", render: (a) => `${formatClock(a.startTime)}–${formatClock(a.endTime)}` },
    {
      key: "schedules",
      header: "Turnos",
      render: (a) => (
        <span className="text-body-sm">
          {a.schedules.map((s) => DAY_LABEL[s.dayOfWeek]).join(" · ") || "—"}
        </span>
      ),
    },
  ];

  const validationColumns: Column<{ employeeCode: string; area: string; result: AccessResult; timestamp: string }>[] = [
    { key: "time", header: "Hora", render: (v) => formatDateTime(v.timestamp) },
    { key: "code", header: "Código", render: (v) => <span className="font-mono text-body-sm">{v.employeeCode}</span> },
    { key: "area", header: "Área", render: (v) => v.area },
    { key: "result", header: "Resultado", render: (v) => <StatusPill status={v.result} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zonas en vivo"
        subtitle="Ocupación, cierre de emergencia, personal por sala y alertas en tiempo real"
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
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setSelectedZone(zone as unknown as ProductionArea)}>
                        <Icon name="badge" size="sm" /> Personal / Autorizaciones
                      </Button>
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
          <span className="label-caps">En vivo + 30 días</span>
        </header>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField id="vf-area" label="Área">
            <Select id="vf-area" value={filterArea} onChange={(e) => setFilterArea(e.target.value)}>
              <Option value="">Todas</Option>
              {stream.zones.map((z) => (
                <Option key={z.name} value={z.name}>{z.name}</Option>
              ))}
            </Select>
          </FormField>
          <FormField id="vf-result" label="Resultado">
            <Select id="vf-result" value={filterResult} onChange={(e) => setFilterResult(e.target.value as AccessResult | "")}>
              <Option value="">Todos</Option>
              <Option value="AUTHORIZED">Autorizado</Option>
              <Option value="DENIED">Denegado</Option>
              <Option value="UNREGISTERED">No registrado</Option>
              <Option value="SUSPENDED">Suspendido</Option>
              <Option value="EXIT">Salida</Option>
            </Select>
          </FormField>
        </div>
        <DataTable
          columns={validationColumns}
          data={validations}
          rowKey={(v) => `${v.timestamp}-${v.employeeCode}`}
          empty={
            <EmptyState
              title="Sin validaciones"
              description={
                stream.validations.length === 0
                  ? "No hay validaciones en los últimos 30 días. Usa Validar Credencial para registrar accesos."
                  : "Ninguna validación coincide con los filtros seleccionados."
              }
              icon="event_busy"
            />
          }
        />
      </section>

      <Modal
        open={!!selectedZone}
        onClose={() => setSelectedZone(null)}
        title={`${selectedZone?.name ?? ""} — Personal y autorizaciones`}
        description="Empleados con acceso asignado a esta zona, autorizaciones vigentes y ocupación actual."
        size="lg"
      >
        <div className="mb-4 rounded-lg border border-outline-variant bg-surface-container/40 p-3">
          <p className="label-caps">Ocupación actual · {zoneOccupancy?.aforo ?? 0} persona(s)</p>
          {zoneOccupancy && zoneOccupancy.people.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {zoneOccupancy.people.map((p) => (
                <li key={p.employeeCode} className="flex items-center justify-between text-body-sm">
                  <span>{p.nombre}</span>
                  <span className="font-mono text-on-surface-variant">
                    {p.employeeCode} · {formatTime(p.entryTime)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-body-sm text-on-surface-variant">Sin personas dentro de esta zona.</p>
          )}
        </div>
        <Tabs
          items={[
            { id: "empleados", label: "Empleados asignados", icon: "badge" },
            { id: "autorizaciones", label: "Autorizaciones", icon: "vpn_key" },
          ]}
          value={modalTab}
          onChange={setModalTab}
        />
        <div className="mt-4">
          {modalTab === "empleados" ? (
            employees.loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : employees.error ? (
              <ErrorState message={employees.error.message} onRetry={employees.refresh} />
            ) : (
              <DataTable
                columns={employeeColumns}
                data={employees.data ?? []}
                rowKey={(e) => e.employeeCode}
                empty={<p className="text-body-sm text-on-surface-variant">Sin empleados asignados a esta zona.</p>}
              />
            )
          ) : authorizations.loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : authorizations.error ? (
            <ErrorState message={authorizations.error.message} onRetry={authorizations.refresh} />
          ) : (
            <DataTable
              columns={authColumns}
              data={authorizations.data ?? []}
              rowKey={(a) => a.id}
              empty={<p className="text-body-sm text-on-surface-variant">Sin autorizaciones para esta zona.</p>}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
