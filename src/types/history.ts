import type { AccessResult, ReportFormat } from "./common";

export interface AccessHistoryResponse {
  id: string;
  employeeCode: string | null;
  employeeName: string | null;
  position: string | null;
  department: string;
  productionAreaName: string;
  timestamp: string;
  result: AccessResult;
}

export interface SupervisorStatsResponse {
  totalAccesosHoy: number;
  accesosAutorizadosHoy: number;
  accesosDenegadosHoy: number;
  accesosNoRegistradosHoy: number;
  accesosSuspendidosHoy: number;
  totalPermisosActivos: number;
  totalPermisosSuspendidos: number;
  empleadosConAcceso: number;
}

export interface ExportRequest {
  formato: ReportFormat;
  fechaInicio: string;
  fechaFin: string;
  employeeCode?: string;
  departamentoName?: string;
  resultado?: AccessResult;
}
