import api from '@/lib/api';
import { Archive, CreateArchiveDTO, UpdateArchiveDTO, ArchiveFilter, PaginatedResponse } from '@/types/archive.types';

const ArchiveService = {
  // Get all archives with optional filters
  getAllArchives: async (filters?: ArchiveFilter, page: number = 1, limit: number = 10) => {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.title) params.append('title', filters.title);
        if (filters.date_from) params.append('date_from', filters.date_from);
        if (filters.date_to) params.append('date_to', filters.date_to);
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
        
        // Handle static hierarchical fields
        if (filters.category_id) params.append('category_id', filters.category_id.toString());
        if (filters.subcategory_id) params.append('subcategory_id', filters.subcategory_id.toString());
        if (filters.location_id) params.append('location_id', filters.location_id.toString());
        if (filters.cabinet_id) params.append('cabinet_id', filters.cabinet_id.toString());
        if (filters.shelf_id) params.append('shelf_id', filters.shelf_id.toString());
        if (filters.position_id) params.append('position_id', filters.position_id.toString());
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
      return response.data;
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
      if (archiveData.date) formData.append('date', archiveData.date);
      
      // Handle static hierarchical fields
      if (archiveData.category_id) {
        formData.append('category_id', archiveData.category_id.toString());
      }
      if (archiveData.subcategory_id) {
        formData.append('subcategory_id', archiveData.subcategory_id.toString());
      }
      if (archiveData.location_id) {
        formData.append('location_id', archiveData.location_id.toString());
      }
      if (archiveData.cabinet_id) {
        formData.append('cabinet_id', archiveData.cabinet_id.toString());
      }
      if (archiveData.shelf_id) {
        formData.append('shelf_id', archiveData.shelf_id.toString());
      }
      if (archiveData.position_id) {
        formData.append('position_id', archiveData.position_id.toString());
      }
      
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
      if (archiveData.date !== undefined) formData.append('date', archiveData.date || '');
      
      // Handle static hierarchical fields
      if (archiveData.category_id !== undefined) {
        formData.append('category_id', archiveData.category_id.toString());
      }
      if (archiveData.subcategory_id !== undefined) {
        formData.append('subcategory_id', archiveData.subcategory_id.toString());
      }
      if (archiveData.location_id !== undefined) {
        formData.append('location_id', archiveData.location_id.toString());
      }
      if (archiveData.cabinet_id !== undefined) {
        formData.append('cabinet_id', archiveData.cabinet_id.toString());
      }
      if (archiveData.shelf_id !== undefined) {
        formData.append('shelf_id', archiveData.shelf_id.toString());
      }
      if (archiveData.position_id !== undefined) {
        formData.append('position_id', archiveData.position_id.toString());
      }
      
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