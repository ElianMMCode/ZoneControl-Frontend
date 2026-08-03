import type { DocumentType, EmployeeStatus, Role } from "./common";

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
}

export interface BulkUploadResult {
  total: number;
  successes: number;
  errors: number;
  errorReportUrl: string | null;
}
