import { useState, useEffect, useCallback } from 'react';
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
import StaticFieldService from '@/services/staticField.service';
import { useToast } from '@/hooks/use-toast';

export const useStaticFields = () => {
  const { toast } = useToast();
  
  // State for all hierarchical levels
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaticFieldService.getAllCategories();
      setCategories(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch categories';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch subcategories by category
  const fetchSubcategoriesByCategory = useCallback(async (categoryId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaticFieldService.getSubcategoriesByCategory(categoryId);
      setSubcategories(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch subcategories';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch locations by subcategory
  const fetchLocationsBySubcategory = useCallback(async (subcategoryId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaticFieldService.getLocationsBySubcategory(subcategoryId);
      setLocations(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch locations';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch cabinets by location
  const fetchCabinetsByLocation = useCallback(async (locationId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaticFieldService.getCabinetsByLocation(locationId);
      setCabinets(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch cabinets';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch shelves by cabinet
  const fetchShelvesByCabinet = useCallback(async (cabinetId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaticFieldService.getShelvesByCabinet(cabinetId);
      setShelves(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch shelves';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch positions by shelf
  const fetchPositionsByShelf = useCallback(async (shelfId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaticFieldService.getPositionsByShelf(shelfId);
      setPositions(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch positions';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create functions
  const createCategory = useCallback(async (data: CreateCategoryDTO) => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaticFieldService.createCategory(data);
      await fetchCategories(); // Refresh the list
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create category';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, toast]);

  const createSubcategory = useCallback(async (data: CreateSubcategoryDTO) => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaticFieldService.createSubcategory(data);
      if (data.category_id) {
        await fetchSubcategoriesByCategory(data.category_id); // Refresh the list
      }
      toast({
        title: 'Success',
        description: 'Subcategory created successfully',
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create subcategory';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSubcategoriesByCategory, toast]);

  const createLocation = useCallback(async (data: CreateLocationDTO) => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaticFieldService.createLocation(data);
      if (data.subcategory_id) {
        await fetchLocationsBySubcategory(data.subcategory_id); // Refresh the list
      }
      toast({
        title: 'Success',
        description: 'Location created successfully',
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create location';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchLocationsBySubcategory, toast]);

  const createCabinet = useCallback(async (data: CreateCabinetDTO) => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaticFieldService.createCabinet(data);
      if (data.location_id) {
        await fetchCabinetsByLocation(data.location_id); // Refresh the list
      }
      toast({
        title: 'Success',
        description: 'Cabinet created successfully',
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create cabinet';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCabinetsByLocation, toast]);

  const createShelf = useCallback(async (data: CreateShelfDTO) => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaticFieldService.createShelf(data);
      if (data.cabinet_id) {
        await fetchShelvesByCabinet(data.cabinet_id); // Refresh the list
      }
      toast({
        title: 'Success',
        description: 'Shelf created successfully',
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create shelf';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchShelvesByCabinet, toast]);

  const createPosition = useCallback(async (data: CreatePositionDTO) => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaticFieldService.createPosition(data);
      if (data.shelf_id) {
        await fetchPositionsByShelf(data.shelf_id); // Refresh the list
      }
      toast({
        title: 'Success',
        description: 'Position created successfully',
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create position';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPositionsByShelf, toast]);

  // Helper functions to get filtered data - wrapped with useCallback to prevent re-renders
  const getSubcategoriesByCategory = useCallback((categoryId: number) => {
    return subcategories.filter(sub => sub.category_id === categoryId);
  }, [subcategories]);

  const getLocationsBySubcategory = useCallback((subcategoryId: number) => {
    return locations.filter(loc => loc.subcategory_id === subcategoryId);
  }, [locations]);

  const getCabinetsByLocation = useCallback((locationId: number) => {
    return cabinets.filter(cab => cab.location_id === locationId);
  }, [cabinets]);

  const getShelvesByCabinet = useCallback((cabinetId: number) => {
    return shelves.filter(shelf => shelf.cabinet_id === cabinetId);
  }, [shelves]);

  const getPositionsByShelf = useCallback((shelfId: number) => {
    return positions.filter(pos => pos.shelf_id === shelfId);
  }, [positions]);

  // Fetch all subcategories
  const fetchAllSubcategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaticFieldService.getAllSubcategories();
      setSubcategories(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch subcategories';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch all locations
  const fetchAllLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaticFieldService.getAllLocations();
      setLocations(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch locations';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch all cabinets
  const fetchAllCabinets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaticFieldService.getAllCabinets();
      setCabinets(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch cabinets';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch all shelves
  const fetchAllShelves = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaticFieldService.getAllShelves();
      setShelves(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch shelves';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch all positions
  const fetchAllPositions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaticFieldService.getAllPositions();
      setPositions(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch positions';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update functions
  const updateCategory = useCallback(async (id: number, categoryData: CreateCategoryDTO) => {
    try {
      setLoading(true);
      const response = await StaticFieldService.updateCategory(id, categoryData);
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message,
        });
        await fetchCategories();
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal mengupdate kategori',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, toast]);

  const updateSubcategory = useCallback(async (id: number, subcategoryData: CreateSubcategoryDTO) => {
    try {
      setLoading(true);
      const response = await StaticFieldService.updateSubcategory(id, subcategoryData);
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message,
        });
        await fetchAllSubcategories();
        if (subcategoryData.category_id) {
          await fetchSubcategoriesByCategory(subcategoryData.category_id);
        }
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal mengupdate subkategori',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAllSubcategories, fetchSubcategoriesByCategory, toast]);

  const updateLocation = useCallback(async (id: number, locationData: CreateLocationDTO) => {
    try {
      setLoading(true);
      const response = await StaticFieldService.updateLocation(id, locationData);
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message,
        });
        await fetchAllLocations();
        if (locationData.subcategory_id) {
          await fetchLocationsBySubcategory(locationData.subcategory_id);
        }
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal mengupdate lokasi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAllLocations, fetchLocationsBySubcategory, toast]);

  const updateCabinet = useCallback(async (id: number, cabinetData: CreateCabinetDTO) => {
    try {
      setLoading(true);
      const response = await StaticFieldService.updateCabinet(id, cabinetData);
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message,
        });
        await fetchAllCabinets();
        if (cabinetData.location_id) {
          await fetchCabinetsByLocation(cabinetData.location_id);
        }
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal mengupdate kabinet',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAllCabinets, fetchCabinetsByLocation, toast]);

  const updateShelf = useCallback(async (id: number, shelfData: CreateShelfDTO) => {
    try {
      setLoading(true);
      const response = await StaticFieldService.updateShelf(id, shelfData);
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message,
        });
        await fetchAllShelves();
        if (shelfData.cabinet_id) {
          await fetchShelvesByCabinet(shelfData.cabinet_id);
        }
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal mengupdate rak',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAllShelves, fetchShelvesByCabinet, toast]);

  const updatePosition = useCallback(async (id: number, positionData: CreatePositionDTO) => {
    try {
      setLoading(true);
      const response = await StaticFieldService.updatePosition(id, positionData);
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message,
        });
        await fetchAllPositions();
        if (positionData.shelf_id) {
          await fetchPositionsByShelf(positionData.shelf_id);
        }
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal mengupdate posisi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAllPositions, fetchPositionsByShelf, toast]);

  // Delete functions
  const deleteCategory = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const response = await StaticFieldService.deleteCategory(id);
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message,
        });
        await fetchCategories();
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal menghapus kategori',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, toast]);

  const deleteSubcategory = useCallback(async (id: number, categoryId?: number) => {
    try {
      setLoading(true);
      const response = await StaticFieldService.deleteSubcategory(id);
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message,
        });
        await fetchAllSubcategories();
        if (categoryId) {
          await fetchSubcategoriesByCategory(categoryId);
        }
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal menghapus subkategori',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAllSubcategories, fetchSubcategoriesByCategory, toast]);

  const deleteLocation = useCallback(async (id: number, subcategoryId?: number) => {
    try {
      setLoading(true);
      const response = await StaticFieldService.deleteLocation(id);
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message,
        });
        await fetchAllLocations();
        if (subcategoryId) {
          await fetchLocationsBySubcategory(subcategoryId);
        }
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal menghapus lokasi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAllLocations, fetchLocationsBySubcategory, toast]);

  const deleteCabinet = useCallback(async (id: number, locationId?: number) => {
    try {
      setLoading(true);
      const response = await StaticFieldService.deleteCabinet(id);
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message,
        });
        await fetchAllCabinets();
        if (locationId) {
          await fetchCabinetsByLocation(locationId);
        }
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal menghapus kabinet',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAllCabinets, fetchCabinetsByLocation, toast]);

  const deleteShelf = useCallback(async (id: number, cabinetId?: number) => {
    try {
      setLoading(true);
      const response = await StaticFieldService.deleteShelf(id);
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message,
        });
        await fetchAllShelves();
        if (cabinetId) {
          await fetchShelvesByCabinet(cabinetId);
        }
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal menghapus rak',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAllShelves, fetchShelvesByCabinet, toast]);

  const deletePosition = useCallback(async (id: number, shelfId?: number) => {
    try {
      setLoading(true);
      const response = await StaticFieldService.deletePosition(id);
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message,
        });
        await fetchAllPositions();
        if (shelfId) {
          await fetchPositionsByShelf(shelfId);
        }
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal menghapus posisi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAllPositions, fetchPositionsByShelf, toast]);

  // Load all data on mount
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        fetchCategories(),
        fetchAllSubcategories(),
        fetchAllLocations(),
        fetchAllCabinets(),
        fetchAllShelves(),
        fetchAllPositions()
      ]);
    };
    
    loadAllData();
  }, [fetchCategories, fetchAllSubcategories, fetchAllLocations, fetchAllCabinets, fetchAllShelves, fetchAllPositions]);

  return {
    // Data
    categories,
    subcategories,
    locations,
    cabinets,
    shelves,
    positions,
    
    // State
    loading,
    error,
    
    // Fetch functions
    fetchCategories,
    fetchAllSubcategories,
    fetchAllLocations,
    fetchAllCabinets,
    fetchAllShelves,
    fetchAllPositions,
    fetchSubcategoriesByCategory,
    fetchLocationsBySubcategory,
    fetchCabinetsByLocation,
    fetchShelvesByCabinet,
    fetchPositionsByShelf,
    
    // Helper functions
    getSubcategoriesByCategory,
    getLocationsBySubcategory,
    getCabinetsByLocation,
    getShelvesByCabinet,
    getPositionsByShelf,
    
    // Create functions
    createCategory,
    createSubcategory,
    createLocation,
    createCabinet,
    createShelf,
    createPosition,
    
    // Update functions
    updateCategory,
    updateSubcategory,
    updateLocation,
    updateCabinet,
    updateShelf,
    updatePosition,
    
    // Delete functions
    deleteCategory,
    deleteSubcategory,
    deleteLocation,
    deleteCabinet,
    deleteShelf,
    deletePosition
  };
};