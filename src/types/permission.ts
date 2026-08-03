import type { PermissionStatus } from "./common";

export interface ProductionArea {
  id: string;
  name: string;
  description: string | null;
}

export interface PermissionResponse {
  id: string;
  employeeCode: string;
  employeeName: string;
  areaName: string;
  status: PermissionStatus;
  startDate: string;
  expirationDate: string;
  reactivationDate: string | null;
  startTime: string;
  endTime: string;
}

export interface CreatePermissionRequest {
  employeeCode: string;
  productionAreaName: string;
  startDate: string;
  expirationDate: string;
  startTime: string;
  endTime: string;
}

export interface UpdatePermissionRequest {
  startDate?: string;
  expirationDate?: string;
  startTime?: string;
  endTime?: string;
}
