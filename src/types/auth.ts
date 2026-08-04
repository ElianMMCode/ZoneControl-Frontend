import type { Role } from "./common";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: Role;
  };
  requirePasswordChange: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface UpdateProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

export interface SetupTokenValidationResponse {
  valid: boolean;
  userId: string;
  fullName: string;
  email: string;
}

export interface SetupPasswordRequest {
  token: string;
  newPassword: string;
}
