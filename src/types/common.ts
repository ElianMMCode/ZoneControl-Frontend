export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
}

export type Role = "ADMIN" | "GESTOR_PERSONAL" | "SUPERVISOR_AUDITOR";
export type UserStatus = "ACTIVO" | "INACTIVO";
export type EmployeeStatus = "ACTIVO" | "INACTIVO" | "SUSPENDIDO";
export type PermissionStatus = "ACTIVO" | "SUSPENDIDO";
export type AccessResult = "AUTHORIZED" | "DENIED" | "UNREGISTERED" | "SUSPENDED";
export type DocumentType = "CC" | "CE" | "TI" | "PA" | "RC";
export type ReportFormat = "CSV" | "EXCEL";
export type ContentSection = "INSTITUTIONAL" | "CONTACT" | "LOCATIONS";
