import type { EmployeeStatus, PermissionStatus, WeekDay } from "./common";

export interface ProductionArea {
  id: string;
  name: string;
  description: string | null;
}

export interface PermissionScheduleRequest {
  dayOfWeek: WeekDay;
  startTime: string;
  endTime: string;
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
  schedules?: PermissionScheduleRequest[];
}

export interface UpdatePermissionRequest {
  startDate?: string;
  expirationDate?: string;
  startTime?: string;
  endTime?: string;
  schedules?: PermissionScheduleRequest[];
}

export interface AreaEmployee {
  employeeCode: string;
  employeeName: string;
  position: string | null;
  department: string | null;
  employeeStatus: EmployeeStatus;
}

export interface AreaSchedule {
  dayOfWeek: WeekDay;
  startTime: string;
  endTime: string;
}

export interface AreaAuthorization {
  id: string;
  employeeCode: string;
  employeeName: string;
  position: string | null;
  department: string | null;
  permissionStatus: PermissionStatus;
  startDate: string;
  expirationDate: string;
  reactivationDate: string | null;
  startTime: string;
  endTime: string;
  schedules: AreaSchedule[];
}
