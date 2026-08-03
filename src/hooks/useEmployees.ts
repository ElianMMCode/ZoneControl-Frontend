import type { DocumentType, EmployeeSearchResponse, EmployeeStatus, Page } from "@/types";

export type EmployeeListParams = {
  documentType?: DocumentType;
  documentNumber?: string;
  firstName?: string;
  lastName?: string;
  departmentName?: string;
  status?: EmployeeStatus;
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
    status: p.status,
    page: p.page,
    size: p.size ?? 10,
  };
}

export type { Page, EmployeeSearchResponse };
