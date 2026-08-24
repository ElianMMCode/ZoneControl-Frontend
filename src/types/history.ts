import type { AccessResult, ReportFormat } from "./common";

export interface AccessHistoryResponse {
  id: string;
  employeeId: string | null;
  employeeCode: string | null;
  employeeName: string | null;
  position: string | null;
  department: string;
  productionAreaName: string;
  timestamp: string;
  result: AccessResult;
  hasUser: boolean;
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
  /** null/undefined = todos, true = con usuario, false = sin usuario. */
  conUsuario?: boolean;
}
