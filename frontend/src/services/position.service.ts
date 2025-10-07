import api from '@/lib/api';
import { Position } from '@/types/archive.types';

const PositionService = {
  // Get all positions
  getAllPositions: async () => {
    try {
      const response = await api.get('/positions');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  },

  // Get positions by subcategory ID
  getPositionsBySubcategoryId: async (subcategoryId: number): Promise<Position[]> => {
    try {
      const response = await api.get(`/positions?subcategory_id=${subcategoryId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching positions for subcategory ${subcategoryId}:`, error);
      throw error;
    }
  },

  // Get single position by ID
  getPositionById: async (id: number): Promise<Position> => {
    try {
      const response = await api.get(`/positions/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching position ${id}:`, error);
      throw error;
    }
  },

  // Create new position
  createPosition: async (positionData: { name: string; subcategory_id: number }): Promise<Position> => {
    try {
      const response = await api.post('/positions', positionData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating position:', error);
      throw error;
    }
  },

  // Update position
  updatePosition: async (id: number, positionData: { name: string; subcategory_id: number }): Promise<Position> => {
    try {
      const response = await api.put(`/positions/${id}`, positionData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating position ${id}:`, error);
      throw error;
    }
  },

  // Delete position
  deletePosition: async (id: number): Promise<void> => {
    try {
      await api.delete(`/positions/${id}`);
    } catch (error) {
      console.error(`Error deleting position ${id}:`, error);
      throw error;
    }
  }
};

export default PositionService;