import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Select, Option } from "@/components/ui/Select";
import { Icon } from "@/components/ui/Icon";
import { ErrorState, EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { PartnerPeriodicSection } from "@/components/common/PartnerPeriodicSection";
import { useDepartments, useAreas } from "@/hooks/useGestor";
import { useResource } from "@/hooks/useResource";
import { apiDownload, isApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type {
  AccessHistoryResponse,
  AccessResult,
  Page,
  ReportFormat,
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

function InternalValidationsReport() {
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
      downloadBlob(blob, filename ?? `reporte_validaciones_interno.${ext}`);
      toast.success(`Reporte interno exportado en ${formato}`);
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo exportar el reporte interno");
    } finally {
      setExporting(null);
    }
  };

  const columns: Column<AccessHistoryResponse>[] = [
    { key: "ts", header: "Fecha", render: (h) => formatDateTime(h.timestamp) },
    { key: "code", header: "Código", render: (h) => h.employeeCode ?? "—" },
    { key: "emp", header: "Empleado", render: (h) => h.employeeName ?? "—" },
    { key: "pos", header: "Cargo", render: (h) => h.position ?? "—" },
    { key: "dept", header: "Departamento", render: (h) => h.department },
    { key: "area", header: "Zona", render: (h) => h.productionAreaName },
    { key: "result", header: "Resultado", render: (h) => <StatusPill status={h.result} /> },
  ];

  return (
    <section className="card space-y-4">
      <header className="card-header">
        <h2 className="text-heading-md">Reporte interno de validaciones de acceso</h2>
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
        <FormField id="ri-fechaInicio" label="Fecha inicio" required>
          <input id="ri-fechaInicio" type="date" className="input" value={fechaInicio} onChange={(e) => { setFechaInicio(e.target.value); setPage(0); }} />
        </FormField>
        <FormField id="ri-fechaFin" label="Fecha fin" required>
          <input id="ri-fechaFin" type="date" className="input" value={fechaFin} onChange={(e) => { setFechaFin(e.target.value); setPage(0); }} />
        </FormField>
        <FormField id="ri-code" label="Código de empleado">
          <input id="ri-code" className="input font-mono" value={employeeCode} onChange={(e) => { setEmployeeCode(e.target.value); setPage(0); }} placeholder="EMP-000001" />
        </FormField>
        <FormField id="ri-dept" label="Departamento">
          <Select id="ri-dept" value={department} onChange={(e) => { setDepartment(e.target.value); setPage(0); }} disabled={departments.loading}>
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
        <FormField id="ri-area" label="Zona">
          <Select id="ri-area" value={area} onChange={(e) => { setArea(e.target.value); setPage(0); }} disabled={areas.loading}>
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
        <FormField id="ri-result" label="Resultado">
          <Select id="ri-result" value={resultado} onChange={(e) => { setResultado(e.target.value as AccessResult | ""); setPage(0); }}>
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
          <p className="text-body-sm text-on-surface-variant">
            {history.data.totalElements} registro(s) en total. Usa la exportación para obtener el listado completo con los filtros aplicados.
          </p>
        </>
      ) : (
        <EmptyState title="Sin registros" description="No hay validaciones en el rango seleccionado." icon="fact_check" />
      )}
    </section>
  );
}

export function ReportsView() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes de Auditoría"
        subtitle="Reportes internos de accesos y archivo periódico para el socio internacional"
      />
      <InternalValidationsReport />
      <PartnerPeriodicSection />
    </div>
  );
}
