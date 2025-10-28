// Static Field Interfaces
export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: number;
  name: string;
  description?: string;
  category_id: number;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: number;
  name: string;
  description?: string;
  subcategory_id: number;
  subcategory?: Subcategory;
  created_at: string;
  updated_at: string;
}

export interface Cabinet {
  id: number;
  name: string;
  description?: string;
  location_id: number;
  location?: Location;
  created_at: string;
  updated_at: string;
}

export interface Shelf {
  id: number;
  name: string;
  description?: string;
  cabinet_id: number;
  cabinet?: Cabinet;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: number;
  name: string;
  description?: string;
  shelf_id: number;
  shelf?: Shelf;
  created_at: string;
  updated_at: string;
}

// Create DTOs
export interface CreateCategoryDTO {
  name: string;
  description?: string;
}

export interface CreateSubcategoryDTO {
  name: string;
  description?: string;
  category_id: number;
}

export interface CreateLocationDTO {
  name: string;
  description?: string;
  subcategory_id: number;
}

export interface CreateCabinetDTO {
  name: string;
  description?: string;
  location_id: number;
}

export interface CreateShelfDTO {
  name: string;
  description?: string;
  cabinet_id: number;
}

export interface CreatePositionDTO {
  name: string;
  description?: string;
  shelf_id: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface StaticFieldsResponse<T> {
  success: boolean;
  message: string;
  data: T[];
}