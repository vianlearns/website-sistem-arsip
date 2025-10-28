import api from '@/lib/api';
import { 
  Category, 
  Subcategory, 
  Location, 
  Cabinet, 
  Shelf, 
  Position,
  CreateCategoryDTO,
  CreateSubcategoryDTO,
  CreateLocationDTO,
  CreateCabinetDTO,
  CreateShelfDTO,
  CreatePositionDTO
} from '@/types/staticField.types';

const StaticFieldService = {
  // Categories
  getAllCategories: async () => {
    const response = await api.get('/static-fields/categories');
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/static-fields/categories');
    return response.data.data;
  },

  createCategory: async (categoryData: CreateCategoryDTO): Promise<{ success: boolean; message: string; data: { id: number } }> => {
    const response = await api.post('/static-fields/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id: number, categoryData: CreateCategoryDTO): Promise<{ success: boolean; message: string; data: Category }> => {
    const response = await api.put(`/static-fields/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/static-fields/categories/${id}`);
    return response.data;
  },

  // Subcategories
  getAllSubcategories: async () => {
    const response = await api.get('/static-fields/subcategories');
    return response.data;
  },

  getSubcategories: async (): Promise<Subcategory[]> => {
    const response = await api.get('/static-fields/subcategories');
    return response.data.data;
  },

  getSubcategoriesByCategory: async (categoryId: number) => {
    const response = await api.get(`/static-fields/subcategories/by-category/${categoryId}`);
    return response.data;
  },

  createSubcategory: async (subcategoryData: CreateSubcategoryDTO): Promise<{ success: boolean; message: string; data: { id: number } }> => {
    const response = await api.post('/static-fields/subcategories', subcategoryData);
    return response.data;
  },

  updateSubcategory: async (id: number, subcategoryData: CreateSubcategoryDTO): Promise<{ success: boolean; message: string; data: Subcategory }> => {
    const response = await api.put(`/static-fields/subcategories/${id}`, subcategoryData);
    return response.data;
  },

  deleteSubcategory: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/static-fields/subcategories/${id}`);
    return response.data;
  },

  // Locations
  getAllLocations: async () => {
    const response = await api.get('/static-fields/locations');
    return response.data;
  },

  getLocations: async (): Promise<Location[]> => {
    const response = await api.get('/static-fields/locations');
    return response.data.data;
  },

  getLocationsBySubcategory: async (subcategoryId: number) => {
    const response = await api.get(`/static-fields/locations/by-subcategory/${subcategoryId}`);
    return response.data;
  },

  createLocation: async (locationData: CreateLocationDTO): Promise<{ success: boolean; message: string; data: { id: number } }> => {
    const response = await api.post('/static-fields/locations', locationData);
    return response.data;
  },

  updateLocation: async (id: number, locationData: CreateLocationDTO): Promise<{ success: boolean; message: string; data: Location }> => {
    const response = await api.put(`/static-fields/locations/${id}`, locationData);
    return response.data;
  },

  deleteLocation: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/static-fields/locations/${id}`);
    return response.data;
  },

  // Cabinets
  getAllCabinets: async () => {
    const response = await api.get('/static-fields/cabinets');
    return response.data;
  },

  getCabinets: async (): Promise<Cabinet[]> => {
    const response = await api.get('/static-fields/cabinets');
    return response.data.data;
  },

  getCabinetsByLocation: async (locationId: number) => {
    const response = await api.get(`/static-fields/cabinets/by-location/${locationId}`);
    return response.data;
  },

  createCabinet: async (cabinetData: CreateCabinetDTO): Promise<{ success: boolean; message: string; data: { id: number } }> => {
    const response = await api.post('/static-fields/cabinets', cabinetData);
    return response.data;
  },

  updateCabinet: async (id: number, cabinetData: CreateCabinetDTO): Promise<{ success: boolean; message: string; data: Cabinet }> => {
    const response = await api.put(`/static-fields/cabinets/${id}`, cabinetData);
    return response.data;
  },

  deleteCabinet: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/static-fields/cabinets/${id}`);
    return response.data;
  },

  // Shelves
  getAllShelves: async () => {
    const response = await api.get('/static-fields/shelves');
    return response.data;
  },

  getShelves: async (): Promise<Shelf[]> => {
    const response = await api.get('/static-fields/shelves');
    return response.data.data;
  },

  getShelvesByCabinet: async (cabinetId: number) => {
    const response = await api.get(`/static-fields/shelves/by-cabinet/${cabinetId}`);
    return response.data;
  },

  createShelf: async (shelfData: CreateShelfDTO): Promise<{ success: boolean; message: string; data: { id: number } }> => {
    const response = await api.post('/static-fields/shelves', shelfData);
    return response.data;
  },

  updateShelf: async (id: number, shelfData: CreateShelfDTO): Promise<{ success: boolean; message: string; data: Shelf }> => {
    const response = await api.put(`/static-fields/shelves/${id}`, shelfData);
    return response.data;
  },

  deleteShelf: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/static-fields/shelves/${id}`);
    return response.data;
  },

  // Positions
  getAllPositions: async () => {
    const response = await api.get('/static-fields/positions');
    return response.data;
  },

  getPositions: async (): Promise<Position[]> => {
    const response = await api.get('/static-fields/positions');
    return response.data.data;
  },

  getPositionsByShelf: async (shelfId: number) => {
    const response = await api.get(`/static-fields/positions/by-shelf/${shelfId}`);
    return response.data;
  },

  createPosition: async (positionData: CreatePositionDTO): Promise<{ success: boolean; message: string; data: { id: number } }> => {
    const response = await api.post('/static-fields/positions', positionData);
    return response.data;
  },

  updatePosition: async (id: number, positionData: CreatePositionDTO): Promise<{ success: boolean; message: string; data: Position }> => {
    const response = await api.put(`/static-fields/positions/${id}`, positionData);
    return response.data;
  },

  deletePosition: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/static-fields/positions/${id}`);
    return response.data;
  },
};

export default StaticFieldService;