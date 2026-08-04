import type { Role, UserStatus } from "./common";

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  status: UserStatus;
  requirePasswordChange: boolean;
  pendienteActivacion: boolean;
  employeeCode: string;
  position: string;
}

export interface CreateUserRequest {
  employeeCode: string;
  role: Role;
  status: UserStatus;
}

export interface UpdateUserRequest {
  email: string;
}

export interface StatusUpdateRequest {
  status: UserStatus;
}

export interface StatusUpdateResponse {
  id: string;
  status: UserStatus;
  employeeStatus: string;
}
