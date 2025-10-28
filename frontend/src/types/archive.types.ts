// Static Hierarchical Field Types
export interface LocationHierarchy {
  category?: string;
  subcategory?: string;
  location?: string;
  cabinet?: string;
  shelf?: string;
  position?: string;
}

// Archive Types
export interface Archive {
  id: number;
  title: string;
  description?: string;
  date?: string;
  image?: string;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  is_active: boolean;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  // Static hierarchical fields
  category_id?: number;
  subcategory_id?: number;
  location_id?: number;
  cabinet_id?: number;
  shelf_id?: number;
  position_id?: number;
  location_hierarchy?: LocationHierarchy;
}

// DTO Types for API requests
export interface CreateArchiveDTO {
  title: string;
  description?: string;
  date?: string;
  image?: string | File;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  category_id?: number;
  subcategory_id?: number;
  location_id?: number;
  cabinet_id?: number;
  shelf_id?: number;
  position_id?: number;
}

export interface UpdateArchiveDTO {
  title?: string;
  description?: string;
  date?: string;
  image?: string | File;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  is_active?: boolean;
  category_id?: number;
  subcategory_id?: number;
  location_id?: number;
  cabinet_id?: number;
  shelf_id?: number;
  position_id?: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ArchivesResponse extends PaginatedResponse<Archive> {}
export interface ArchiveResponse extends ApiResponse<Archive> {}

// Filter Types
export interface ArchiveFilter {
  title?: string;
  category_id?: number;
  subcategory_id?: number;
  location_id?: number;
  cabinet_id?: number;
  shelf_id?: number;
  position_id?: number;
  date_from?: string;
  date_to?: string;
  is_active?: boolean;
  search?: string;
}