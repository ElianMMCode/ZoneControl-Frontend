import type { AccessResult } from "./common";

export interface ValidateAccessRequest {
  employeeCode: string;
  productionAreaName: string;
}

export interface ValidateAccessResponse {
  result: AccessResult;
  message: string;
}
