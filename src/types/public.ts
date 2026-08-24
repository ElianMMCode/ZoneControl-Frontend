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
  categoryId: string | null;
  categoryName: string | null;
  imageUrl: string | null;
}

export interface CategoryResponse {
  id: string;
  name: string;
  description: string | null;
}

export interface CategoryRequest {
  name: string;
  description: string;
}

export interface ProductRequest {
  name: string;
  description: string;
  activeIngredient: string;
  presentation: string;
  productionArea: string;
  categoryId?: string | null;
}

export interface OfficeRequest {
  name: string;
  address: string;
  openingHours: string;
  latitude?: number | null;
  longitude?: number | null;
}
