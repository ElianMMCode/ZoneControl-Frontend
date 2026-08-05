import type { ReportFormat } from "./common";

export interface PeriodicReportRequest {
  mes: number;
  anio: number;
  formato: ReportFormat;
  /** Filtro opcional por departamentos (HU-17). Si es vacío se incluyen todos. */
  departmentNames?: string[];
}

export interface PeriodicReportPreviewRow {
  department: string;
  area: string;
  total: number;
  autorizados: number;
  denegados: number;
  noRegistrados: number;
  suspendidos: number;
  pctAutorizados: number;
}

export interface PeriodicReportPreviewDayRow {
  dia: string;
  total: number;
  autorizados: number;
  denegados: number;
  noRegistrados: number;
  suspendidos: number;
}

export interface PeriodicReportPreviewResponse {
  mes: number;
  anio: number;
  formato: ReportFormat;
  departmentNames: string[] | null;
  generatedAt: string;
  areaRows: PeriodicReportPreviewRow[];
  dayRows: PeriodicReportPreviewDayRow[];
}
