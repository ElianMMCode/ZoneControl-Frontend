import type { ReportFormat } from "./common";

export interface PeriodicReportRequest {
  mes: number;
  anio: number;
  formato: ReportFormat;
}
