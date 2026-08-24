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
import { Pagination } from "@/components/common/Pagination";
import { ErrorState, EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { SecurityAlertsPanel } from "@/components/domain/SecurityAlertsPanel";
import { useDepartments, useAreas } from "@/hooks/useGestor";
import { useResource } from "@/hooks/useResource";
import { apiDownload, isApiError } from "@/lib/api";
import { formatDateTime, formatNumber } from "@/lib/format";
import type {
  AccessHistoryResponse,
  AccessResult,
  Page,
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

export function AccessHistoryView() {
  const [fechaInicio, setFechaInicio] = useState(iso(thirtyDaysAgo));
  const [fechaFin, setFechaFin] = useState(iso(today));
  const [employeeCode, setEmployeeCode] = useState("");
  const [department, setDepartment] = useState("");
  const [area, setArea] = useState("");
  const [resultado, setResultado] = useState<AccessResult | "">("");
  const [page, setPage] = useState(0);
  const [exporting, setExporting] = useState<ReportFormat | null>(null);

  const departments = useDepartments();
  const areas = useAreas();

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

  const onExport = async (formato: ReportFormat) => {
    setExporting(formato);
    try {
      const { blob, filename } = await apiDownload("/api/historial/export", {
        method: "POST",
        body: {
          formato,
          fechaInicio,
          fechaFin,
          employeeCode: employeeCode || undefined,
          departamentoName: department || undefined,
          productionAreaName: area || undefined,
          resultado: resultado || undefined,
        },
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
        title="Historial de Accesos"
        subtitle="Registro detallado de entradas y salidas, eventos y alertas de seguridad"
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

      <SecurityAlertsPanel />
    </div>
  );
}
