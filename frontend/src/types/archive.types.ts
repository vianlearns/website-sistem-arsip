// Types yang sesuai dengan struktur database SQL

export interface Archive {
  id: number;
  title: string;
  description: string | null;
  category_id: number | null;
  subcategory_id: number | null;
  position_id: number | null;
  position_name?: string; // Nama posisi dari join backend
  date: string | null; // Format: YYYY-MM-DD
  location: string | null;
  image: string | null; // URL atau path file
  created_by: number | null;
  created_at: string; // ISO 8601 format
  updated_at: string; // ISO 8601 format
  category?: Category;
  subcategory?: SubCategory;
  position?: Position;
  created_by_admin?: Admin;
}

export interface SubCategory {
  id: number;
  name: string;
  category_id: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  category_name?: string; // Menambahkan properti category_name
  positions?: Position[];
}

export interface Position {
  id: number;
  name: string;
  subcategory_id: number;
  created_at: string;
  updated_at: string;
  subcategory?: SubCategory;
  subcategory_name?: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  subcategories?: SubCategory[];
}



export interface Admin {
  id: number;
  username: string;
  name: string;
  last_login: string | null;
}



// DTO untuk create/update archive

export interface ArchiveFilters {
  category_id?: number;
  subcategory_id?: number;
  position_id?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
}
export interface CreateArchiveDTO {
  title: string;
  description?: string;
  category_id?: number;
  subcategory_id?: number;
  position_id?: number;
  category_name?: string;
  subcategory_name?: string;
  date?: string; // YYYY-MM-DD format
  location?: string;
  image?: File | string;
}

export interface UpdateArchiveDTO {
  title?: string;
  description?: string;
  category_id?: number;
  subcategory_id?: number;
  position_id?: number;
  category_name?: string;
  subcategory_name?: string;
  date?: string;
  location?: string;
  image?: File | string;
}

// Response types untuk API
export interface ArchiveResponse {
  success: boolean;
  data: Archive;
  message?: string;
}

export interface ArchivesResponse {
  success: boolean;
  data: Archive[];
  message?: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  message?: string;
}

export interface SubCategoriesResponse {
  success: boolean;
  data: SubCategory[];
  message?: string;
}



// Filter types untuk searching
export interface ArchiveFilters {
  category_id?: number;
  subcategory_id?: number;
  position_id?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}