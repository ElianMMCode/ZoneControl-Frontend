import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Select, Option, SelectField } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useResource } from "@/hooks/useResource";
import { apiFetch, isApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { AccessResult, ExitResponse, ValidateAccessResponse } from "@/types";

type Mode = "entrada" | "salida";
type ValidationResult = ValidateAccessResponse | ExitResponse;

const RESULT_STYLE: Record<
  AccessResult,
  { tone: "active" | "inactive" | "warning" | "error"; title: string; icon: string }
> = {
  AUTHORIZED: { tone: "active", title: "INGRESO AUTORIZADO", icon: "check_circle" },
  DENIED: { tone: "error", title: "INGRESO DENEGADO", icon: "block" },
  UNREGISTERED: { tone: "warning", title: "NO REGISTRADO", icon: "help" },
  SUSPENDED: { tone: "error", title: "ACCESO SUSPENDIDO", icon: "pause_circle" },
  EXIT: { tone: "inactive", title: "SALIDA REGISTRADA", icon: "logout" },
};

const MODE_ITEMS = [
  { id: "entrada", label: "Entrada", icon: "login" },
  { id: "salida", label: "Salida", icon: "logout" },
];

interface Zone {
  name: string;
  description: string | null;
  emergencyClosed: boolean;
}

export function AccessKioskPanel() {
  const zones = useResource<Zone[]>("/api/public/zonas");
  const [mode, setMode] = useState<Mode>("entrada");
  const [employeeCode, setEmployeeCode] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const selectedZone = zones.data?.find((z) => z.name === zoneName) ?? null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZone) {
      toast.error("Selecciona una zona");
      return;
    }
    if (!employeeCode.trim()) {
      toast.error("Ingresa tu número de empleado");
      return;
    }
    setSubmitting(true);
    setResult(null);
    const body = { employeeCode: `EMP-${employeeCode.trim()}`, productionAreaName: selectedZone.name };
    try {
      const res =
        mode === "entrada"
          ? await apiFetch<ValidateAccessResponse>("/api/access/validate", { method: "POST", body })
          : await apiFetch<ExitResponse>("/api/access/exit", { method: "POST", body });
      setResult(res);
      setEmployeeCode("");
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error(mode === "entrada" ? "No se pudo validar el acceso" : "No se pudo registrar la salida");
    } finally {
      setSubmitting(false);
    }
  };

  const style = result ? RESULT_STYLE[result.result] : null;
  const isExit = result?.result === "EXIT";

  return (
    <div className="space-y-4">
      <Tabs
        items={MODE_ITEMS}
        value={mode}
        onChange={(id) => {
          setMode(id as Mode);
          setResult(null);
        }}
      />
      {zones.loading ? (
        <Skeleton className="h-12 w-full rounded-md" />
      ) : zones.error ? (
        <p className="text-body-sm text-error">No se pudieron cargar las zonas.</p>
      ) : !zones.data || zones.data.length === 0 ? (
        <EmptyState title="Sin zonas" description="No hay zonas disponibles." icon="domain_disabled" />
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <SelectField id="kiosk-zone" label="Zona de producción" required>
            <Select
              id="kiosk-zone"
              value={zoneName}
              onChange={(e) => {
                setZoneName(e.target.value);
                setResult(null);
              }}
            >
              <Option value="">Selecciona una zona…</Option>
              {zones.data.map((z) => (
                <Option key={z.name} value={z.name}>
                  {z.name}
                </Option>
              ))}
            </Select>
          </SelectField>
          {selectedZone?.emergencyClosed ? (
            <p className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <Badge tone="error">Emergencia</Badge> Zona cerrada por emergencia
            </p>
          ) : null}
          <FormField id="kiosk-code" label="Número de empleado" required>
            <div className="flex items-stretch">
              <span className="grid place-items-center rounded-l-md border border-r-0 border-outline-variant bg-surface-container px-3 font-mono text-lg text-on-surface-variant">
                EMP-
              </span>
              <input
                id="kiosk-code"
                className="input font-mono text-lg rounded-l-none"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000001"
                maxLength={10}
                inputMode="numeric"
                autoComplete="off"
              />
            </div>
          </FormField>
          <Button type="submit" size="lg" loading={submitting} className="w-full">
            <Icon name={mode === "entrada" ? "login" : "logout"} size="sm" />
            {mode === "entrada" ? "Validar entrada" : "Registrar salida"}
          </Button>
        </form>
      )}

      {result && style ? (
        <div
          className={`flex flex-col items-center gap-3 rounded-md border p-6 text-center ${
            style.tone === "active"
              ? "border-secondary/30 bg-secondary-container/20 text-secondary"
              : style.tone === "warning"
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : style.tone === "inactive"
                  ? "border-outline-variant bg-surface-container/50 text-on-surface"
                  : "border-error/30 bg-error-container/20 text-error"
          }`}
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-current/10">
            <Icon name={style.icon} size="lg" />
          </span>
          <p className="text-heading-md font-semibold">{style.title}</p>
          <p className="text-body-md">{result.message}</p>
          <dl className="grid w-full grid-cols-2 gap-2 text-left">
            <div>
              <dt className="label-caps">Empleado</dt>
              <dd className="text-body-sm">{result.employeeName ?? result.employeeCode}</dd>
            </div>
            <div>
              <dt className="label-caps">Zona</dt>
              <dd className="text-body-sm">{result.productionAreaName ?? zoneName}</dd>
            </div>
            {isExit && "timestamp" in result && result.timestamp ? (
              <div>
                <dt className="label-caps">Hora de salida</dt>
                <dd className="text-body-sm">{formatDateTime(result.timestamp)}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}
    </div>
  );
}
