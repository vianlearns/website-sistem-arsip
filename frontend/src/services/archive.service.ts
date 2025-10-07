import api from '@/lib/api';
import { Archive, CreateArchiveDTO, UpdateArchiveDTO, ArchiveFilters, PaginatedResponse } from '@/types/archive.types';

const ArchiveService = {
  // Get all archives with optional filters
  getAllArchives: async (filters?: ArchiveFilters, page: number = 1, limit: number = 10) => {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.category_id) params.append('category_id', filters.category_id.toString());
        if (filters.subcategory_id) params.append('subcategory_id', filters.subcategory_id.toString());
        if (filters.position_id) params.append('position_id', filters.position_id.toString());
        if (filters.search) params.append('search', filters.search);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
      }
      
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const response = await api.get(`/archives?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching archives:', error);
      throw error;
    }
  },

  // Get single archive by ID
  getArchiveById: async (id: number): Promise<Archive> => {
    try {
      const response = await api.get(`/archives/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching archive ${id}:`, error);
      throw error;
    }
  },

  // Create new archive
  createArchive: async (archiveData: CreateArchiveDTO): Promise<Archive> => {
    try {
      const formData = new FormData();
      
      // Handle file upload if image is provided
      if (archiveData.image && archiveData.image instanceof File) {
        formData.append('image', archiveData.image);
      }
      
      formData.append('title', archiveData.title);
      if (archiveData.description) formData.append('description', archiveData.description);
      if (archiveData.category_id) formData.append('category_id', archiveData.category_id.toString());
      if (archiveData.category_name) formData.append('category_name', archiveData.category_name);
      if (archiveData.subcategory_id) formData.append('subcategory_id', archiveData.subcategory_id.toString());
      if (archiveData.subcategory_name) formData.append('subcategory_name', archiveData.subcategory_name);
      if (archiveData.position_id) formData.append('position_id', archiveData.position_id.toString());
      if (archiveData.date) formData.append('date', archiveData.date);
      if (archiveData.location) formData.append('location', archiveData.location);
      

      
      const response = await api.post('/archives', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error creating archive:', error);
      throw error;
    }
  },

  // Update existing archive
  updateArchive: async (id: number, archiveData: UpdateArchiveDTO): Promise<Archive> => {
    try {
      const formData = new FormData();
      
      // Handle file upload if new image is provided
      if (archiveData.image && archiveData.image instanceof File) {
        formData.append('image', archiveData.image);
      }
      
      if (archiveData.title) formData.append('title', archiveData.title);
      if (archiveData.description !== undefined) formData.append('description', archiveData.description || '');
      if (archiveData.category_id !== undefined) formData.append('category_id', archiveData.category_id?.toString() || '');
      if (archiveData.category_name) formData.append('category_name', archiveData.category_name);
      if (archiveData.subcategory_id !== undefined) formData.append('subcategory_id', archiveData.subcategory_id?.toString() || '');
      if (archiveData.subcategory_name) formData.append('subcategory_name', archiveData.subcategory_name);
      if (archiveData.position_id !== undefined) formData.append('position_id', archiveData.position_id?.toString() || '');
      if (archiveData.date !== undefined) formData.append('date', archiveData.date || '');
      if (archiveData.location !== undefined) formData.append('location', archiveData.location || '');
      

      
      const response = await api.put(`/archives/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`Error updating archive ${id}:`, error);
      throw error;
    }
  },

  // Delete archive
  deleteArchive: async (id: number): Promise<void> => {
    try {
      await api.delete(`/archives/${id}`);
    } catch (error) {
      console.error(`Error deleting archive ${id}:`, error);
      throw error;
    }
  },

  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      // Handle both old and new response formats
      if (response.data && response.data.success && response.data.data) {
        // New format with success and data fields
        return response.data.data;
      } else {
        // Old format where data is directly in response.data
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },



  // Upload image
  uploadImage: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },
};

export default ArchiveService;