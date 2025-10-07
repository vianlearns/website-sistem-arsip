import { useState, useEffect } from 'react';
import { SubCategory } from '../types/archive.types';
import SubCategoryService from '../services/subcategory.service';
import { useToast } from '@/hooks/use-toast';

export const useSubCategories = (categoryId?: number) => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (categoryId) {
        setLoading(true);
        try {
          const data = await SubCategoryService.getSubCategories(categoryId);
          setSubCategories(data);
        } catch (error) {
          console.error('Error fetching subcategories:', error);
          toast({
            title: 'Error',
            description: 'Gagal mengambil data sub kategori',
            variant: 'destructive'
          });
        } finally {
          setLoading(false);
        }
      } else {
        setSubCategories([]);
      }
    };

    fetchSubCategories();
  }, [categoryId, toast]);

  return { subCategories, loading };
};

export const useSubCategoryOperations = () => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const getSubCategories = async (categoryId?: number) => {
    setLoading(true);
    try {
      const data = await SubCategoryService.getSubCategories(categoryId);
      setSubCategories(data);
      return data;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data sub kategori',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createSubCategory = async (name: string, categoryId: number) => {
    setLoading(true);
    try {
      const newSubCategory = await SubCategoryService.createSubCategory(name, categoryId);
      if (newSubCategory) {
        setSubCategories([...subCategories, newSubCategory]);
        toast({
          title: 'Sukses',
          description: 'Sub kategori berhasil dibuat',
          variant: 'default'
        });
        return newSubCategory;
      }
      return null;
    } catch (error: any) {
      console.error('Error creating subcategory:', error);
      const errorMessage = error.response?.data?.message || 'Gagal membuat sub kategori';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSubCategory = async (id: number, name: string, categoryId: number) => {
    setLoading(true);
    try {
      const updatedSubCategory = await SubCategoryService.updateSubCategory(id, name, categoryId);
      if (updatedSubCategory) {
        setSubCategories(
          subCategories.map((subCategory) =>
            subCategory.id === id ? updatedSubCategory : subCategory
          )
        );
        toast({
          title: 'Sukses',
          description: 'Sub kategori berhasil diperbarui',
          variant: 'default',
        });
        return updatedSubCategory;
      }
      return null;
    } catch (error: any) {
      console.error('Error updating subcategory:', error);
      const errorMessage = error.response?.data?.message || 'Gagal memperbarui sub kategori';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteSubCategory = async (id: number) => {
    setLoading(true);
    try {
      const success = await SubCategoryService.deleteSubCategory(id);
      if (success) {
        setSubCategories(subCategories.filter((subCategory) => subCategory.id !== id));
        toast({
          title: 'Sukses',
          description: 'Sub kategori berhasil dihapus',
          variant: 'default',
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error deleting subcategory:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menghapus sub kategori';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    subCategories,
    loading,
    getSubCategories,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
  };
};