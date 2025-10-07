import api from '@/lib/api';
import { Category } from '@/types/archive.types';

const CategoryService = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
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

  // Create new category
  createCategory: async (categoryData: { name: string }): Promise<Category> => {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update existing category
  updateCategory: async (id: number, categoryData: { name: string }): Promise<Category> => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (id: number): Promise<void> => {
    try {
      await api.delete(`/categories/${id}`);
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  },
};

export default CategoryService;