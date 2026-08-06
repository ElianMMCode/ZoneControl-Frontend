import type { DocumentType, EmployeeSearchResponse, EmployeeStatus, Page, Role } from "@/types";

export type EmployeeListParams = {
  documentType?: DocumentType;
  documentNumber?: string;
  firstName?: string;
  lastName?: string;
  departmentName?: string;
  cargoName?: string;
  status?: EmployeeStatus;
  systemRole?: Role | null;
  page?: number;
  size?: number;
};

export function employeeListQuery(p: EmployeeListParams) {
  return {
    documentType: p.documentType,
    documentNumber: p.documentNumber,
    firstName: p.firstName,
    lastName: p.lastName,
    departmentName: p.departmentName,
    cargoName: p.cargoName,
    status: p.status,
    systemRole: p.systemRole,
    page: p.page,
    size: p.size ?? 10,
  };
}

export type { Page, EmployeeSearchResponse };
