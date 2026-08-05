import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button, Spinner } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Select, Option } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { useAreas } from "@/hooks/useGestor";
import { apiFetch, isApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { AccessResult, ExitResponse, ValidateAccessResponse } from "@/types";

type ValidationResult = ValidateAccessResponse | ExitResponse;
type Mode = "entrada" | "salida";

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

export function AccessValidationView() {
  const [mode, setMode] = useState<Mode>("entrada");
  const [employeeCode, setEmployeeCode] = useState("");
  const [area, setArea] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const areas = useAreas();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeCode.trim()) {
      toast.error("Ingresa el código del empleado");
      return;
    }
    if (!area) {
      toast.error("Selecciona una zona de acceso");
      return;
    }
    setSubmitting(true);
    setResult(null);
    const body = { employeeCode: employeeCode.trim(), productionAreaName: area };
    try {
      const res =
        mode === "entrada"
          ? await apiFetch<ValidateAccessResponse>("/api/access/validate", { method: "POST", body })
          : await apiFetch<ExitResponse>("/api/access/exit", { method: "POST", body });
      setResult(res);
      setEmployeeCode("");
      setArea("");
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
    <div className="space-y-6">
      <PageHeader
        title="Validación de Credenciales"
        subtitle="Control de acceso en tiempo real para zonas restringidas"
        actions={<Badge tone="active">Sistema operativo</Badge>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card space-y-4">
          <Tabs
            items={MODE_ITEMS}
            defaultValue="entrada"
            onChange={(id) => {
              setMode(id as Mode);
              setResult(null);
            }}
          />
          <h2 className="text-heading-md">{mode === "entrada" ? "Registrar entrada" : "Registrar salida"}</h2>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField id="employeeCode" label="Código de empleado" required>
              <input
                id="employeeCode"
                className="input font-mono"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder="EMP-000001"
                maxLength={20}
                autoComplete="off"
              />
            </FormField>
            <FormField id="area" label="Zona de acceso" required>
              <Select id="area" value={area} onChange={(e) => setArea(e.target.value)} disabled={areas.loading} required>
                {areas.loading ? (
                  <Option value="">Cargando áreas…</Option>
                ) : !areas.data || areas.data.length === 0 ? (
                  <Option value="">No hay áreas disponibles</Option>
                ) : (
                  <>
                    <Option value="">Selecciona una zona</Option>
                    {areas.data.map((a) => (
                      <Option key={a.id} value={a.name}>{a.name}</Option>
                    ))}
                  </>
                )}
              </Select>
            </FormField>
            <Button type="submit" size="lg" loading={submitting || areas.loading} className="w-full">
              {submitting ? (
                <Spinner />
              ) : (
                <Icon name={mode === "entrada" ? "verified_user" : "logout"} size="sm" />
              )}
              {mode === "entrada" ? "Validar acceso" : "Registrar salida"}
            </Button>
          </form>
          <p className="text-body-sm text-on-surface-variant">
            {mode === "entrada"
              ? "Cada intento queda registrado en el historial de accesos con marca de tiempo, independientemente del resultado."
              : "La salida cierra la sesión activa del empleado en la zona y queda registrada en el historial."}
          </p>
        </section>

        <section className="card space-y-4">
          <h2 className="text-heading-md">Resultado</h2>
          {!result ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-on-surface-variant">
              <span className="rounded-full bg-surface-container p-4">
                <Icon name="qr_code_scanner" size="lg" />
              </span>
              <p className="text-body-sm">
                {mode === "entrada"
                  ? "Ingresa el código del empleado y valida el acceso."
                  : "Ingresa el código del empleado y la zona para registrar la salida."}
              </p>
            </div>
          ) : style ? (
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
              {result.employeeName ? (
                <dl className="grid w-full grid-cols-1 gap-2 text-left sm:grid-cols-2">
                  <div>
                    <dt className="label-caps">Empleado</dt>
                    <dd className="text-body-sm">{result.employeeName}</dd>
                  </div>
                  {result.position ? (
                    <div>
                      <dt className="label-caps">Cargo</dt>
                      <dd className="text-body-sm">{result.position}</dd>
                    </div>
                  ) : null}
                  {result.department ? (
                    <div>
                      <dt className="label-caps">Departamento</dt>
                      <dd className="text-body-sm">{result.department}</dd>
                    </div>
                  ) : null}
                  {result.employeeCode ? (
                    <div>
                      <dt className="label-caps">Código</dt>
                      <dd className="font-mono text-body-sm">{result.employeeCode}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="label-caps">Zona</dt>
                    <dd className="text-body-sm">{result.productionAreaName ?? area}</dd>
                  </div>
                  {isExit && "timestamp" in result && result.timestamp ? (
                    <div>
                      <dt className="label-caps">Hora de salida</dt>
                      <dd className="text-body-sm">{formatDateTime(result.timestamp)}</dd>
                    </div>
                  ) : null}
                </dl>
              ) : (
                <dl className="grid w-full grid-cols-2 gap-2 text-left">
                  <div>
                    <dt className="label-caps">Código</dt>
                    <dd className="font-mono text-body-sm">{result.employeeCode ?? employeeCode.trim()}</dd>
                  </div>
                  <div>
                    <dt className="label-caps">Zona</dt>
                    <dd className="text-body-sm">{result.productionAreaName ?? area}</dd>
                  </div>
                </dl>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
