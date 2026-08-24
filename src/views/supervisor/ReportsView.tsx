import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Select, Option } from "@/components/ui/Select";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { ErrorState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDepartments } from "@/hooks/useGestor";
import { apiDownload, apiFetch, isApiError } from "@/lib/api";
import { formatDateTime, formatNumber } from "@/lib/format";
import type {
  PeriodicReportPreviewResponse,
  ReportFormat,
} from "@/types";

const today = new Date();

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsView() {
  const [exportingPeriodic, setExportingPeriodic] = useState(false);

  const [mes, setMes] = useState(today.getMonth() + 1);
  const [anio, setAnio] = useState(today.getFullYear());
  const [formatoPeriodico, setFormatoPeriodico] = useState<ReportFormat>("CSV");
  const [deptosPeriodico, setDeptosPeriodico] = useState<string[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PeriodicReportPreviewResponse | null>(null);
  const [previewDownloading, setPreviewDownloading] = useState(false);

  const departments = useDepartments();

  const periodicBody = () => ({
    mes,
    anio,
    formato: formatoPeriodico,
    departmentNames: deptosPeriodico.length > 0 ? deptosPeriodico : undefined,
  });

  const onExportPeriodic = async () => {
    setExportingPeriodic(true);
    try {
      const { blob, filename } = await apiDownload("/api/reportes/archivo-periodico", {
        method: "POST",
        body: periodicBody(),
      });
      const ext = formatoPeriodico === "CSV" ? "csv" : formatoPeriodico === "EXCEL" ? "xlsx" : "pdf";
      downloadBlob(blob, filename ?? `archivo_periodico_${mes}_${anio}.${ext}`);
      toast.success(`Archivo periódico generado (${formatoPeriodico})`);
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo generar el archivo periódico");
    } finally {
      setExportingPeriodic(false);
    }
  };

  const onOpenPreview = async () => {
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreview(null);
    try {
      const res = await apiFetch<PeriodicReportPreviewResponse>("/api/reportes/archivo-periodico/preview", {
        method: "POST",
        body: periodicBody(),
      });
      setPreview(res);
    } catch (err) {
      if (isApiError(err)) setPreviewError(err.message);
      else setPreviewError("No se pudo generar la vista previa");
    } finally {
      setPreviewLoading(false);
    }
  };

  const onDownloadFromPreview = async () => {
    if (!preview) return;
    setPreviewDownloading(true);
    try {
      const { blob, filename } = await apiDownload("/api/reportes/archivo-periodico", {
        method: "POST",
        body: {
          mes: preview.mes,
          anio: preview.anio,
          formato: preview.formato,
          departmentNames: preview.departmentNames ?? undefined,
        },
      });
      const ext = preview.formato === "CSV" ? "csv" : preview.formato === "EXCEL" ? "xlsx" : "pdf";
      downloadBlob(blob, filename ?? `partner_periodic_file_${preview.anio}_${preview.mes}.${ext}`);
      toast.success(`Archivo descargado (${preview.formato})`);
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo descargar el archivo");
    } finally {
      setPreviewDownloading(false);
    }
  };

  const toggleDepto = (name: string) => {
    setDeptosPeriodico((prev) =>
      prev.includes(name) ? prev.filter((d) => d !== name) : [...prev, name],
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes de Auditoría"
        subtitle="Archivo periódico de actividad para el socio internacional"
      />

      <section className="card space-y-4">
        <header className="card-header">
          <h2 className="text-heading-md">Archivo periódico para socios</h2>
        </header>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <FormField id="mes" label="Mes" required>
            <Select id="mes" value={String(mes)} onChange={(e) => setMes(Number(e.target.value))}>
              {Array.from({ length: 12 }).map((_, i) => (
                <Option key={i + 1} value={String(i + 1)}>{new Date(2000, i, 1).toLocaleDateString("es-CO", { month: "long" })}</Option>
              ))}
            </Select>
          </FormField>
          <FormField id="anio" label="Año" required>
            <input id="anio" type="number" className="input" min={2020} max={2100} value={anio} onChange={(e) => setAnio(Number(e.target.value))} />
          </FormField>
          <FormField id="formatoPeriodico" label="Formato">
            <Select id="formatoPeriodico" value={formatoPeriodico} onChange={(e) => setFormatoPeriodico(e.target.value as ReportFormat)}>
              <Option value="CSV">CSV</Option>
              <Option value="EXCEL">Excel</Option>
              <Option value="PDF">PDF</Option>
            </Select>
          </FormField>
          <div className="flex items-end gap-2">
            <Button onClick={onExportPeriodic} loading={exportingPeriodic} disabled={!mes || !anio}>
              <Icon name="download" size="sm" /> Generar archivo
            </Button>
            <Button variant="secondary" onClick={onOpenPreview} loading={previewLoading} disabled={!mes || !anio}>
              <Icon name="send" size="sm" /> Enviar a socio internacional
            </Button>
          </div>
        </div>

        <fieldset>
          <legend className="field-label">Departamentos incluidos</legend>
          {departments.loading ? (
            <p className="text-body-sm text-on-surface-variant">Cargando departamentos…</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {departments.data?.map((d) => {
                const selected = deptosPeriodico.includes(d);
                return (
                  <label
                    key={d}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-body-sm transition-colors ${
                      selected
                        ? "border-primary bg-primary-container/40 text-primary"
                        : "border-outline-variant text-on-surface-variant hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="size-3.5 accent-primary"
                      checked={selected}
                      onChange={() => toggleDepto(d)}
                    />
                    {d}
                  </label>
                );
              })}
              <button
                type="button"
                className="text-body-sm font-medium text-primary hover:underline"
                onClick={() => setDeptosPeriodico([])}
              >
                Limpiar selección
              </button>
            </div>
          )}
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Sin selección se incluyen todos los departamentos. El archivo agrega por departamento con log detallado.
          </p>
        </fieldset>
      </section>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Vista previa del archivo periódico"
        description={preview ? `Período ${preview.mes}/${preview.anio} · Formato ${preview.formato}` : "Agregación por departamento sin datos personales"}
        size="lg"
        footer={
          preview ? (
            <>
              <Button variant="secondary" onClick={() => setPreviewOpen(false)}>Cerrar</Button>
              <Button onClick={onDownloadFromPreview} loading={previewDownloading}>
                <Icon name="download" size="sm" /> Descargar archivo
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setPreviewOpen(false)}>Cerrar</Button>
          )
        }
      >
        {previewLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : previewError ? (
          <ErrorState message={previewError} onRetry={onOpenPreview} />
        ) : preview ? (
          <div className="space-y-4">
            {preview.departmentNames?.length ? (
              <p className="text-body-sm text-on-surface-variant">
                Departamentos: {preview.departmentNames.join(", ")}
              </p>
            ) : null}
            <p className="label-caps">Resumen por departamento × área</p>
            <DataTable
              columns={[
                { key: "dept", header: "Departamento", render: (r) => r.department },
                { key: "area", header: "Área", render: (r) => r.area },
                { key: "total", header: "Total", render: (r) => formatNumber(r.total) },
                { key: "aut", header: "Autorizados", render: (r) => formatNumber(r.autorizados) },
                { key: "den", header: "Denegados", render: (r) => formatNumber(r.denegados) },
                { key: "noreg", header: "No registrados", render: (r) => formatNumber(r.noRegistrados) },
                { key: "susp", header: "Suspendidos", render: (r) => formatNumber(r.suspendidos) },
                { key: "pct", header: "% Autorizados", render: (r) => `${r.pctAutorizados}%` },
              ]}
              data={preview.areaRows}
              rowKey={(r) => `${r.department}-${r.area}`}
            />
            <p className="label-caps">Distribución por día</p>
            <DataTable
              columns={[
                { key: "dia", header: "Día", render: (r) => r.dia },
                { key: "total", header: "Total", render: (r) => formatNumber(r.total) },
                { key: "aut", header: "Autorizados", render: (r) => formatNumber(r.autorizados) },
                { key: "den", header: "Denegados", render: (r) => formatNumber(r.denegados) },
                { key: "noreg", header: "No registrados", render: (r) => formatNumber(r.noRegistrados) },
                { key: "susp", header: "Suspendidos", render: (r) => formatNumber(r.suspendidos) },
              ]}
              data={preview.dayRows}
              rowKey={(r) => r.dia}
            />
            <p className="text-body-sm text-on-surface-variant">
              Generado el {formatDateTime(preview.generatedAt)}. Agregación sin datos personales; esto es lo que recibiría el socio internacional. Descarga el archivo para adjuntarlo.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
