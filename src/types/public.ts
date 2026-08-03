export interface InstitutionalResponse {
  info: Record<string, string>;
}

export interface ContactResponse {
  contact: Record<string, string>;
}

export interface OfficeResponse {
  name: string;
  address: string;
  openingHours: string;
  latitude: number | null;
  longitude: number | null;
}

export interface CatalogResponse {
  name: string;
  description: string;
  activeIngredient: string;
  presentation: string;
  productionArea: string;
}

export interface ProductRequest {
  name: string;
  description: string;
  activeIngredient: string;
  presentation: string;
  productionArea: string;
}

export interface OfficeRequest {
  name: string;
  address: string;
  openingHours: string;
  latitude?: number | null;
  longitude?: number | null;
}
