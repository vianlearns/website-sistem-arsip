import api from '@/lib/api';
import { SubCategory, SubCategoriesResponse } from '../types/archive.types';

class SubCategoryService {
  private baseUrl = '/subcategories';

  async getSubCategories(categoryId?: number): Promise<SubCategory[]> {
    try {
      let url = this.baseUrl;
      if (categoryId) {
        url = `${url}?category_id=${categoryId}`;
      }
      const response = await api.get(url);
      
      // Handle both new and old response format
      if (response.data.success !== undefined) {
        const typedResponse = response.data as SubCategoriesResponse;
        return typedResponse.data;
      } else {
        return response.data as SubCategory[];
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      return [];
    }
  }

  async getSubCategoryById(id: number): Promise<SubCategory | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      
      // Handle both new and old response format
      if (response.data.success !== undefined) {
        const typedResponse = response.data as { success: boolean; data: SubCategory; message?: string };
        return typedResponse.data;
      } else {
        return response.data as SubCategory;
      }
    } catch (error) {
      console.error(`Error fetching subcategory with id ${id}:`, error);
      return null;
    }
  }

  async createSubCategory(name: string, categoryId: number): Promise<SubCategory | null> {
    try {
      const response = await api.post(this.baseUrl, { name, category_id: categoryId });
      
      // Handle both new and old response format
      if (response.data.success !== undefined) {
        const typedResponse = response.data as { success: boolean; data: SubCategory; message?: string };
        return typedResponse.data;
      } else {
        return response.data as SubCategory;
      }
    } catch (error) {
      console.error('Error creating subcategory:', error);
      throw error;
    }
  }

  async updateSubCategory(id: number, name: string, categoryId: number): Promise<SubCategory | null> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, { name, category_id: categoryId });
      
      // Handle both new and old response format
      if (response.data.success !== undefined) {
        const typedResponse = response.data as { success: boolean; data: SubCategory; message?: string };
        return typedResponse.data;
      } else {
        return response.data as SubCategory;
      }
    } catch (error) {
      console.error(`Error updating subcategory with id ${id}:`, error);
      throw error;
    }
  }

  async deleteSubCategory(id: number): Promise<boolean> {
    try {
      const response = await api.delete(`${this.baseUrl}/${id}`);
      
      // Handle both new and old response format
      if (response.data.success !== undefined) {
        return response.data.success;
      } else {
        return response.status === 200 || response.status === 204;
      }
    } catch (error) {
      console.error(`Error deleting subcategory with id ${id}:`, error);
      throw error;
    }
  }
}

export default new SubCategoryService();