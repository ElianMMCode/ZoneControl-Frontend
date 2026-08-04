import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button, Spinner } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Select, Option } from "@/components/ui/Select";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { apiFetch, isApiError } from "@/lib/api";
import type { AccessResult, ValidateAccessResponse } from "@/types";

const AREAS = [
  "Sala Blanca A",
  "Sala Blanca B",
  "Laboratorio QC",
  "Almacén Controlado",
  "Zona de Empaque",
];

const RESULT_STYLE: Record<
  AccessResult,
  { tone: "active" | "error" | "warning"; title: string; icon: string }
> = {
  AUTHORIZED: { tone: "active", title: "INGRESO AUTORIZADO", icon: "check_circle" },
  DENIED: { tone: "error", title: "INGRESO DENEGADO", icon: "block" },
  UNREGISTERED: { tone: "warning", title: "NO REGISTRADO", icon: "help" },
  SUSPENDED: { tone: "error", title: "ACCESO SUSPENDIDO", icon: "pause_circle" },
};

export function AccessValidationView() {
  const [employeeCode, setEmployeeCode] = useState("");
  const [area, setArea] = useState(AREAS[0]);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<ValidateAccessResponse | null>(null);

  const onValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeCode.trim()) {
      toast.error("Ingresa el código del empleado");
      return;
    }
    setValidating(true);
    setResult(null);
    try {
      const res = await apiFetch<ValidateAccessResponse>("/api/access/validate", {
        method: "POST",
        body: { employeeCode: employeeCode.trim(), productionAreaName: area },
      });
      setResult(res);
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo validar el acceso");
    } finally {
      setValidating(false);
    }
  };

  const style = result ? RESULT_STYLE[result.result] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Validación de Credenciales"
        subtitle="Control de acceso en tiempo real para zonas restringidas"
        actions={<Badge tone="active">Sistema operativo</Badge>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card space-y-4">
          <h2 className="text-heading-md">Ingresar datos</h2>
          <form onSubmit={onValidate} className="space-y-4" noValidate>
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
              <Select id="area" value={area} onChange={(e) => setArea(e.target.value)}>
                {AREAS.map((a) => (
                  <Option key={a} value={a}>{a}</Option>
                ))}
              </Select>
            </FormField>
            <Button type="submit" size="lg" loading={validating} className="w-full">
              {validating ? <Spinner /> : <Icon name="verified_user" size="sm" />} Validar acceso
            </Button>
          </form>
          <p className="text-body-sm text-on-surface-variant">
            Cada intento queda registrado en el historial de accesos con marca de tiempo,
            independientemente del resultado.
          </p>
        </section>

        <section className="card space-y-4">
          <h2 className="text-heading-md">Resultado</h2>
          {!result ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-on-surface-variant">
              <span className="rounded-full bg-surface-container p-4">
                <Icon name="qr_code_scanner" size="lg" />
              </span>
              <p className="text-body-sm">Ingresa el código del empleado y valida el acceso.</p>
            </div>
          ) : style ? (
            <div
              className={`flex flex-col items-center gap-3 rounded-md border p-6 text-center ${
                style.tone === "active"
                  ? "border-secondary/30 bg-secondary-container/20 text-secondary"
                  : style.tone === "warning"
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-error/30 bg-error-container/20 text-error"
              }`}
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-current/10">
                <Icon name={style.icon} size="lg" />
              </span>
              <p className="text-heading-md font-semibold">{style.title}</p>
              <p className="text-body-md">{result.message}</p>
              <dl className="mt-2 grid w-full grid-cols-2 gap-2 text-left">
                <div>
                  <dt className="label-caps">Código</dt>
                  <dd className="font-mono text-body-sm">{employeeCode.trim()}</dd>
                </div>
                <div>
                  <dt className="label-caps">Zona</dt>
                  <dd className="text-body-sm">{area}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
