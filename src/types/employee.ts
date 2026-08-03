import type {
  ContractType,
  DocumentType,
  EmployeeStatus,
  Role,
  WorkShift,
} from "./common";

export interface EmployeeResponse {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  position: string;
  email: string | null;
  documentType: DocumentType;
  documentNumber: string;
  departmentName: string;
  status: EmployeeStatus;
  systemRole: Role | null;
  contractType: ContractType | null;
  baseOfficeName: string | null;
  workShift: WorkShift | null;
  hireDate: string | null;
  contractEndDate: string | null;
  photoUrl: string | null;
}

export interface EmployeeSearchResponse extends EmployeeResponse {}

export interface RegisterEmployeeRequest {
  documentType: DocumentType;
  documentNumber: string;
  firstName: string;
  lastName: string;
  position: string;
  departmentName: string;
  email?: string;
  systemRole?: Role;
  contractType?: ContractType;
  baseOfficeName?: string;
  workShift?: WorkShift;
  hireDate?: string;
  contractEndDate?: string;
}

export interface RegisterEmployeeResponse {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  position?: string;
  email?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  departmentName?: string;
  status?: EmployeeStatus;
  systemRole?: Role;
  contractType?: ContractType;
  baseOfficeName?: string;
  workShift?: WorkShift;
  hireDate?: string;
  contractEndDate?: string;
}

export interface BulkUploadResult {
  total: number;
  successes: number;
  errors: number;
  errorReportUrl: string | null;
}

export interface AccessHistoryRecord {
  id: string;
  employee: { id: string } | null;
  department: string | null;
  productionAreaName: string | null;
  timestamp: string;
  result:
    | "AUTHORIZED"
    | "DENIED"
    | "UNREGISTERED"
    | "SUSPENDED";
}

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  TIEMPO_COMPLETO: "Tiempo completo",
  MEDIO_TIEMPO: "Medio tiempo",
  TEMPORAL: "Temporal",
  CONTRATISTA: "Contratista",
  PRACTICANTE: "Practicante",
};

export const WORK_SHIFT_LABELS: Record<WorkShift, string> = {
  DIURNO: "Diurno",
  NOCTURNO: "Nocturno",
  MIXTO: "Mixto",
};
