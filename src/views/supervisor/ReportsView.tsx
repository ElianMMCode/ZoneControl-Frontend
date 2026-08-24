import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusPill } from "@/components/common/StatusPill";
import { StatCard } from "@/components/common/StatCard";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Select, Option } from "@/components/ui/Select";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/common/Pagination";
import { ErrorState, EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDepartments, useAreas } from "@/hooks/useGestor";
import { useResource } from "@/hooks/useResource";
import { apiDownload, apiFetch, isApiError } from "@/lib/api";
import { formatDateTime, formatNumber } from "@/lib/format";
import type {
  AccessHistoryResponse,
  AccessResult,
  Page,
  PeriodicReportPreviewResponse,
  ReportFormat,
  SupervisorStatsResponse,
} from "@/types";

const today = new Date();
const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
const iso = (d: Date) => d.toISOString().slice(0, 10);

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsView() {
  const [fechaInicio, setFechaInicio] = useState(iso(thirtyDaysAgo));
  const [fechaFin, setFechaFin] = useState(iso(today));
  const [employeeCode, setEmployeeCode] = useState("");
  const [department, setDepartment] = useState("");
  const [area, setArea] = useState("");
  const [resultado, setResultado] = useState<AccessResult | "">("");
  const [page, setPage] = useState(0);
  const [exporting, setExporting] = useState<ReportFormat | null>(null);
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
  const areas = useAreas();

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
      downloadBlob(blob, filename ?? `archivo_periodico_${preview.mes}_${preview.anio}.${ext}`);
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

  const stats = useResource<SupervisorStatsResponse>("/api/historial/stats");
  const history = useResource<Page<AccessHistoryResponse>>("/api/historial", {
    fechaInicio,
    fechaFin,
    employeeCode: employeeCode || undefined,
    department: department || undefined,
    productionAreaName: area || undefined,
    resultado: resultado || undefined,
    page,
    size: 10,
  }, [fechaInicio, fechaFin, employeeCode, department, area, resultado, page]);

  const exportFilters = {
    fechaInicio,
    fechaFin,
    employeeCode: employeeCode || undefined,
    departamentoName: department || undefined,
    productionAreaName: area || undefined,
    resultado: resultado || undefined,
  };

  const onExport = async (formato: ReportFormat) => {
    setExporting(formato);
    try {
      const { blob, filename } = await apiDownload("/api/historial/export", {
        method: "POST",
        body: { formato, ...exportFilters },
      });
      const ext = formato === "CSV" ? "csv" : formato === "EXCEL" ? "xlsx" : "pdf";
      downloadBlob(blob, filename ?? `historial_accesos.${ext}`);
      toast.success(`Historial exportado en ${formato}`);
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo exportar el historial");
    } finally {
      setExporting(null);
    }
  };

  const columns: Column<AccessHistoryResponse>[] = [
    { key: "ts", header: "Fecha", render: (h) => formatDateTime(h.timestamp) },
    { key: "code", header: "Código", render: (h) => h.employeeCode ?? "—" },
    { key: "emp", header: "Empleado", render: (h) => h.employeeName ?? "—" },
    { key: "area", header: "Área", render: (h) => h.productionAreaName },
    { key: "dept", header: "Departamento", render: (h) => h.department },
    { key: "result", header: "Resultado", render: (h) => <StatusPill status={h.result} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes de Auditoría"
        subtitle="Historial de accesos, exportación de documentos y archivo periódico para socios"
      />

      {stats.loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : stats.error ? (
        <ErrorState message={stats.error.message} onRetry={stats.refresh} />
      ) : stats.data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Accesos hoy" value={formatNumber(stats.data.totalAccesosHoy)} icon="door_front" />
          <StatCard label="Autorizados" value={formatNumber(stats.data.accesosAutorizadosHoy)} icon="check_circle" tone="secondary" />
          <StatCard label="Denegados" value={formatNumber(stats.data.accesosDenegadosHoy)} icon="block" tone="error" />
          <StatCard label="Permisos activos" value={formatNumber(stats.data.totalPermisosActivos)} icon="vpn_key" />
          <StatCard label="Empleados con acceso" value={formatNumber(stats.data.empleadosConAcceso)} icon="badge" />
        </div>
      ) : null}

      <section className="card space-y-4">
        <header className="card-header">
          <h2 className="text-heading-md">Consulta de historial</h2>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => onExport("CSV")} loading={exporting === "CSV"}>
              <Icon name="download" size="sm" /> CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onExport("EXCEL")} loading={exporting === "EXCEL"}>
              <Icon name="download" size="sm" /> Excel
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onExport("PDF")} loading={exporting === "PDF"}>
              <Icon name="download" size="sm" /> PDF
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FormField id="fechaInicio" label="Fecha inicio" required>
            <input id="fechaInicio" type="date" className="input" value={fechaInicio} onChange={(e) => { setFechaInicio(e.target.value); setPage(0); }} />
          </FormField>
          <FormField id="fechaFin" label="Fecha fin" required>
            <input id="fechaFin" type="date" className="input" value={fechaFin} onChange={(e) => { setFechaFin(e.target.value); setPage(0); }} />
          </FormField>
          <FormField id="employeeCode" label="Código de empleado">
            <input id="employeeCode" className="input font-mono" value={employeeCode} onChange={(e) => { setEmployeeCode(e.target.value); setPage(0); }} placeholder="EMP-000001" />
          </FormField>
          <FormField id="department" label="Departamento">
            <Select id="department" value={department} onChange={(e) => { setDepartment(e.target.value); setPage(0); }} disabled={departments.loading}>
              {departments.loading ? (
                <Option value="">Cargando…</Option>
              ) : (
                <>
                  <Option value="">Todos</Option>
                  {departments.data?.map((d) => (
                    <Option key={d} value={d}>{d}</Option>
                  ))}
                </>
              )}
            </Select>
          </FormField>
          <FormField id="area" label="Área">
            <Select id="area" value={area} onChange={(e) => { setArea(e.target.value); setPage(0); }} disabled={areas.loading}>
              {areas.loading ? (
                <Option value="">Cargando…</Option>
              ) : (
                <>
                  <Option value="">Todas</Option>
                  {areas.data?.map((a) => (
                    <Option key={a.id} value={a.name}>{a.name}</Option>
                  ))}
                </>
              )}
            </Select>
          </FormField>
          <FormField id="resultado" label="Resultado">
            <Select id="resultado" value={resultado} onChange={(e) => { setResultado(e.target.value as AccessResult | ""); setPage(0); }}>
              <Option value="">Todos</Option>
              <Option value="AUTHORIZED">Autorizado</Option>
              <Option value="DENIED">Denegado</Option>
              <Option value="UNREGISTERED">No registrado</Option>
              <Option value="SUSPENDED">Suspendido</Option>
              <Option value="EXIT">Salida</Option>
            </Select>
          </FormField>
        </div>

        {history.loading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : history.error ? (
          <ErrorState message={history.error.message} onRetry={history.refresh} />
        ) : history.data && history.data.content.length > 0 ? (
          <>
            <DataTable columns={columns} data={history.data.content} rowKey={(h) => h.id} />
            <Pagination
              page={history.data.number}
              totalPages={history.data.totalPages}
              totalElements={history.data.totalElements}
              pageSize={history.data.size}
              onPageChange={setPage}
              itemLabel="registros"
            />
          </>
        ) : (
          <EmptyState title="Sin registros" description="No hay accesos en el rango seleccionado." icon="history" />
        )}
      </section>

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
            Sin selección se incluyen todos los departamentos. El archivo agrega por departamento sin datos personales.
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
