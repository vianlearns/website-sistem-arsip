import { useState, useCallback } from 'react';
import { Category } from '@/types/archive.types';
import CategoryService from '@/services/category.service';
import { useToast } from '@/hooks/use-toast';

export const useCategoryOperations = () => {
  const { toast } = useToast();

  const getCategories = async (): Promise<Category[]> => {
    try {
      return await CategoryService.getCategories();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal memuat kategori';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const createCategory = async (categoryData: { name: string }): Promise<Category> => {
    try {
      const newCategory = await CategoryService.createCategory(categoryData);
      return newCategory;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal menambahkan kategori';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCategory = async (id: number, categoryData: { name: string }): Promise<Category> => {
    try {
      const updatedCategory = await CategoryService.updateCategory(id, categoryData);
      return updatedCategory;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal memperbarui kategori';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteCategory = async (id: number): Promise<void> => {
    try {
      await CategoryService.deleteCategory(id);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal menghapus kategori';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};