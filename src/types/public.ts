export interface InstitutionalResponse {
  info: Record<string, string>;
}

export interface ContactResponse {
  contact: Record<string, string>;
}

export interface OfficeResponse {
  id: string;
  name: string;
  address: string;
  openingHours: string;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
}

export interface CatalogResponse {
  id: string;
  name: string;
  description: string;
  activeIngredient: string;
  presentation: string;
  productionArea: string;
  imageUrl: string | null;
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
