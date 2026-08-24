import { useState } from "react";
import { toast } from "sonner";
import { Button, Spinner } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
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

export function ValidateAccessView() {
  const zones = useResource<Zone[]>("/api/public/zonas");
  const [mode, setMode] = useState<Mode>("entrada");
  const [employeeCode, setEmployeeCode] = useState("");
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZone) {
      toast.error("Selecciona una zona");
      return;
    }
    if (!employeeCode.trim()) {
      toast.error("Ingresa el código del empleado");
      return;
    }
    setSubmitting(true);
    setResult(null);
    const body = { employeeCode: employeeCode.trim(), productionAreaName: selectedZone.name };
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
    <div className="min-h-screen bg-surface-container-lowest">
      <PublicNavbar />
      <main className="mx-auto max-w-[1280px] px-6 py-12">
        <header className="mb-8 text-center">
          <h1 className="text-heading-lg text-public-on-surface">Validación de Acceso</h1>
          <p className="mt-2 text-body-md text-public-on-surface-variant">
            Selecciona tu zona y registra tu entrada o salida con el código de empleado.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="label-caps mb-3">1. Selecciona tu zona</h2>
          {zones.loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
            </div>
          ) : zones.error ? (
            <p className="text-body-sm text-error">No se pudieron cargar las zonas.</p>
          ) : !zones.data || zones.data.length === 0 ? (
            <EmptyState title="Sin zonas" description="No hay zonas disponibles." icon="domain_disabled" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {zones.data.map((z) => {
                const selected = selectedZone?.name === z.name;
                return (
                  <button
                    key={z.name}
                    type="button"
                    onClick={() => { setSelectedZone(z); setResult(null); }}
                    aria-pressed={selected}
                    className={`rounded-lg border p-5 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary-container/30 ring-2 ring-primary"
                        : "border-outline-variant bg-public-surface hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 font-semibold text-public-on-surface">
                        <Icon name={selected ? "check_box" : "check_box_outline_blank"} size="sm" />
                        {z.name}
                      </span>
                      {z.emergencyClosed && <Badge tone="error">Emergencia</Badge>}
                    </div>
                    {z.description ? (
                      <p className="mt-2 line-clamp-2 text-body-sm text-public-on-surface-variant">{z.description}</p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {selectedZone ? (
          <section className="mx-auto max-w-[720px] space-y-6">
            <h2 className="label-caps">2. Registra tu {mode} en {selectedZone.name}</h2>
            <div className="card space-y-4">
              <Tabs
                items={MODE_ITEMS}
                defaultValue="entrada"
                onChange={(id) => { setMode(id as Mode); setResult(null); }}
              />
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <FormField id="kiosk-code" label="Código de empleado" required>
                  <input
                    id="kiosk-code"
                    className="input font-mono text-lg"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="EMP-000001"
                    maxLength={20}
                    autoComplete="off"
                    autoFocus
                  />
                </FormField>
                <Button type="submit" size="lg" loading={submitting} className="w-full">
                  {submitting ? <Spinner /> : <Icon name={mode === "entrada" ? "login" : "logout"} size="sm" />}
                  {mode === "entrada" ? "Validar entrada" : "Registrar salida"}
                </Button>
              </form>

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
                      <dd className="text-body-sm">{result.productionAreaName ?? selectedZone.name}</dd>
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

              <p className="text-body-sm text-on-surface-variant">
                Cada intento queda registrado en el historial de accesos con marca de tiempo, independientemente del resultado.
              </p>
            </div>
          </section>
        ) : null}
      </main>
      <PublicFooter />
    </div>
  );
}
