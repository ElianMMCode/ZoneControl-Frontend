import type { AccessResult } from "./common";

export interface ValidateAccessRequest {
  employeeCode: string;
  productionAreaName: string;
}

export interface ValidateAccessResponse {
  result: AccessResult;
  message: string;
}

export interface ZoneSnapshot {
  name: string;
  emergencyClosed: boolean;
}

export interface Occupant {
  employeeCode: string;
  nombre: string;
  entryTime: string;
}

export interface AreaOccupancy {
  area: string;
  aforo: number;
  people: Occupant[];
}

export interface AccessAlertDto {
  id: string;
  tipo: "ACCESO_NOCTURNO" | "DENEGACIONES_REPETIDAS" | "ZONA_EMERGENCIA" | "ACCESO_FUERA_HORARIO";
  severidad: "LOW" | "MEDIUM" | "HIGH";
  employeeCode: string | null;
  productionAreaName: string | null;
  message: string;
  timestamp: string;
  leido: boolean;
}

export type RealtimeEvent =
  | { type: "snapshot"; zones: ZoneSnapshot[]; occupancy: AreaOccupancy[] }
  | { type: "access.validated"; employeeCode: string; area: string; result: AccessResult; message: string; timestamp: string }
  | { type: "occupancy.updated"; timestamp: string }
  | { type: "zone.updated"; area: string; emergencyClosed: boolean }
  | { type: "alert.created"; alert: AccessAlertDto };

